/**
 * Job 628: a naming doc's `tokens` block. The schema's shape and its one self-contained rule, the emitted-name
 * helpers, the resolution checks tools/naming.ts shares with the token build (tools/lib/token_naming.ts), and the
 * codemod rule that moves emitted token names in generated code, in both directions and exactly inverse on the
 * committed Button output. The token build itself is never spawned here; the job's gate builds it into logs/.
 */
import { cpSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { namingDef, tokenPathName } from '../../schema/naming.ts';
import { sourceDir } from '../../schema/platforms.ts';
import { TOKEN_NAMES, TOKENS } from '../../schema/tokens.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { loadTokenNaming } from '../lib/token_naming.ts';
import { camelName, cssName, emittedCamelName, emittedCssName, THEME_MEMBERS } from '../lib/tokens.ts';
import * as naming from '../naming.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();
const savedPaths = { ...naming.paths };

let dir = '';

beforeEach(() => {
  dir = tmp();
  Object.assign(naming.paths, { ROOT: dir, THEMES: join(dir, 'themes'), COMPONENTS: join(dir, 'components.json') });
});

afterEach(() => {
  Object.assign(naming.paths, savedPaths);
});

function doc(brand: string, frontmatter: string): string {
  return write(join(naming.paths.THEMES, brand, 'naming.md'), `---\ntitle: ${brand}\nnaming:\n${frontmatter}---\n\nProse.\n`);
}

function resolveDoc(frontmatter: string): naming.Resolution {
  doc('brand', frontmatter);
  return naming.resolve('brand');
}

/** A `tokens` block with a single rename; `extra` adds more frontmatter under `naming:`. */
function renaming(rename: Record<string, string>, extra = ''): string {
  return `${extra}  tokens:\n    rename:\n${Object.entries(rename).map(([from, to]) => `      ${from}: ${to}\n`).join('')}`;
}

/** The codemod fixture: token variables share the namespace's prefix, and two tokens move onto brand paths. */
const ACME = `  namespace:
    cssPrefix: acme
  tokens:
    cssPrefix: acme
    rename:
      color.action.primary.background: color.brand.primary
      color.inverse.link: color.link.inverse
`;

function rw(text: string, res: naming.Resolution, platform: string, file: string, direction: naming.Direction = 'brand'): string {
  return naming.rewrite(text, naming.vocab(res, platform, direction), file);
}

describe('schema/naming.ts: tokens', () => {
  test('every public token name and every full manifest path satisfies the one path regex', () => {
    for (const name of [...TOKEN_NAMES, ...Object.keys(TOKENS)]) expect(name).toMatch(tokenPathName);
  });

  test('optional, defaulting to {}, with both keys optional', () => {
    expect(namingDef.parse({}).tokens).toEqual({});
    expect(namingDef.parse({ tokens: { cssPrefix: 'acme' } }).tokens).toEqual({ cssPrefix: 'acme' });
    expect(namingDef.parse({ tokens: { rename: { 'color.foreground': 'ink.default' } } }).tokens).toEqual({ rename: { 'color.foreground': 'ink.default' } });
  });

  test("cssPrefix takes namespace.cssPrefix's regex, and has no default", () => {
    const r = namingDef.safeParse({ tokens: { cssPrefix: '--acme' } });
    expect(r.error?.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual([
      'tokens.cssPrefix: Expected a lowercase prefix like acme, written without the leading -- or trailing -',
    ]);
  });

  test('a rename key or brand path that is not a dotted token path is refused', () => {
    expect(namingDef.safeParse({ tokens: { rename: { 'Color.foreground': 'ink' } } }).success).toBe(false);
    expect(namingDef.safeParse({ tokens: { rename: { 'color.foreground': 'brand-ink' } } }).success).toBe(false);
    expect(namingDef.safeParse({ tokens: { rename: { 'color.foreground': '2.ink' } } }).success).toBe(false);
  });

  test('the block is strict', () => {
    expect(namingDef.safeParse({ tokens: { prefix: 'acme' } }).success).toBe(false);
  });

  test('two paths renamed onto one brand path is an issue, worded like props', () => {
    const r = namingDef.safeParse({
      tokens: { rename: { 'color.action.primary.background': 'color.brand', 'color.action.secondary.background': 'color.brand' } },
    });
    expect(r.error?.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual([
      'tokens.rename.color.action.secondary.background: color.action.secondary.background and color.action.primary.background both rename to color.brand',
    ]);
  });
});

describe('tools/lib/tokens.ts: the emitted names', () => {
  test('with nothing that applies, today’s names', () => {
    for (const t of [{}, { rename: { 'color.border': 'line' } }]) {
      expect(emittedCssName('color.foreground.default', t)).toBe(cssName('color.foreground.default'));
      expect(emittedCssName('color.foreground.default', t)).toBe('--color-foreground');
      expect(emittedCamelName('color.foreground.default', t)).toBe(camelName('color.foreground.default'));
      expect(emittedCamelName('font.size.2xl', t)).toBe('fontSize2xl');
    }
  });

  test('a prefix reaches the CSS name only', () => {
    const t = { cssPrefix: 'acme' };
    expect(emittedCssName('color.foreground.default', t)).toBe('--acme-color-foreground');
    expect(emittedCssName('font.lineHeight.tight', t)).toBe('--acme-font-line-height-tight');
    expect(emittedCamelName('color.foreground.default', t)).toBe('colorForeground');
  });

  test('a rename moves both names onto the brand path, with and without a prefix', () => {
    const rename = { 'color.action.primary.background': 'color.brand.primary', 'color.foreground': 'ink' };
    expect(emittedCssName('color.action.primary.background', { rename })).toBe('--color-brand-primary');
    expect(emittedCssName('color.action.primary.background', { rename, cssPrefix: 'acme' })).toBe('--acme-color-brand-primary');
    expect(emittedCamelName('color.action.primary.background', { rename, cssPrefix: 'acme' })).toBe('colorBrandPrimary');
    expect(emittedCssName('color.foreground.default', { rename, cssPrefix: 'acme' }), 'a full path renames through its public name').toBe('--acme-ink');
    expect(emittedCamelName('color.foreground.default', { rename })).toBe('ink');
    expect(emittedCssName('color.background.default', { rename, cssPrefix: 'acme' }), 'an unrenamed token keeps its path').toBe('--acme-color-background');
  });

  test("THEME_MEMBERS is tokens/build.mjs's set", () => {
    const text = readFileSync(join(REPO_ROOT, 'tokens', 'build.mjs'), 'utf8');
    const body = /const THEME_MEMBERS = new Set\(\[([^\]]*)\]\);/.exec(text)?.[1];
    expect(body, 'build.mjs declares THEME_MEMBERS as a Set literal').toBeDefined();
    const built = [...(body as string).matchAll(/'([^']+)'/g)].map((m) => m[1] as string);
    expect(built).toHaveLength(THEME_MEMBERS.size);
    expect([...built].sort()).toEqual([...THEME_MEMBERS].sort());
  });
});

describe('resolving tokens (tools/naming.ts and tools/lib/token_naming.ts)', () => {
  test('Resolution.tokens holds renames only, and a block that changes a name is not a no-op', () => {
    const res = resolveDoc(renaming({ 'color.foreground': 'color.foreground', 'color.border': 'color.line' }));
    expect(res.tokens).toEqual({ rename: { 'color.border': 'color.line' } });
    expect(naming.isNoop(res)).toBe(false);
    expect(naming.isNoop(resolveDoc('  tokens:\n    cssPrefix: acme\n'))).toBe(false);
    expect(naming.isNoop(resolveDoc(renaming({ 'color.foreground': 'color.foreground' })))).toBe(true);
    expect(naming.resolve(null).tokens).toEqual({ rename: {} });
  });

  test('a key that is not a manifest name is stranded, through assertKnownKeys', () => {
    doc('brand', renaming({ 'color.nope': 'color.ink' }));
    expect(() => naming.resolve('brand')).toThrow(naming.NamingError);
    expect(() => naming.resolve('brand')).toThrow(/1 key\(s\) name nothing in the canonical schema:\n {4}tokens\.rename\.color\.nope: no token is called color\.nope/);
  });

  test('a key ending in .default is stranded with its public spelling named', () => {
    doc('brand', renaming({ 'color.foreground.default': 'color.ink' }));
    expect(() => naming.resolve('brand')).toThrow("tokens.rename.color.foreground.default: a key is the token's public name, without the trailing .default: color.foreground");
  });

  test('a brand path that is another canonical path is refused, unless that token is renamed away too', () => {
    doc('brand', renaming({ 'color.action.primary.background': 'color.foreground' }));
    expect(() => naming.resolve('brand')).toThrow(naming.NamingError);
    expect(() => naming.resolve('brand')).toThrow(
      'tokens.rename.color.action.primary.background: color.action.primary.background renames to color.foreground, which is already a token — rename color.foreground too, or pick another path',
    );
    const swapped = resolveDoc(renaming({ 'color.foreground': 'color.foreground.strong', 'color.foreground.strong': 'color.foreground' }));
    expect(Object.keys(swapped.tokens.rename)).toHaveLength(2);
  });

  test('two tokens whose emitted CSS names and camel names coincide are refused', () => {
    doc('brand', renaming({ 'color.action.primary.background': 'color.brandPrimary', 'color.action.secondary.background': 'color.brand.primary' }));
    expect(() => naming.resolve('brand')).toThrow(
      'tokens.rename.color.action.secondary.background: color.action.primary.background and color.action.secondary.background both emit the CSS variable --color-brand-primary',
    );
    expect(() => naming.resolve('brand')).toThrow('both emit the JS key colorBrandPrimary');
  });

  test('two tokens whose camel names alone coincide are refused', () => {
    doc('brand', renaming({ 'color.action.primary.background': 'color.x2', 'color.action.secondary.background': 'color.x.2' }));
    expect(() => naming.resolve('brand')).toThrow('color.action.primary.background and color.action.secondary.background both emit the JS key colorX2');
    expect(() => naming.resolve('brand')).not.toThrow('CSS variable');
  });

  test("an emitted camel name that is one of build.mjs's THEME_MEMBERS is refused", () => {
    doc('brand', renaming({ 'color.foreground': 'color.scheme' }));
    expect(() => naming.resolve('brand')).toThrow('tokens.rename.color.foreground: color.foreground emits the Swift name colorScheme, which would shadow Theme.colorScheme');
  });

  describe('when tokens.cssPrefix equals namespace.cssPrefix', () => {
    beforeEach(() => {
      write(naming.paths.COMPONENTS, JSON.stringify([{ component: { name: 'Button' } }, { component: { name: 'AlertDialog' } }]));
    });

    const shared = (rename: Record<string, string>, components = ''): string =>
      `  namespace:\n    cssPrefix: acme\n${components}  tokens:\n    cssPrefix: acme\n    rename:\n${Object.entries(rename).map(([f, t]) => `      ${f}: ${t}\n`).join('')}`;

    test("a token variable that starts with a canonical component's hook stem is refused", () => {
      doc('brand', shared({ 'color.foreground': 'alert.dialog.ink' }));
      expect(() => naming.resolve('brand')).toThrow(
        "tokens.rename.color.foreground: color.foreground emits --acme-alert-dialog-ink, a name inside AlertDialog's component hooks (--acme-alert-dialog-…), because tokens.cssPrefix is namespace.cssPrefix",
      );
    });

    test('or equals one', () => {
      doc('brand', shared({ 'color.foreground': 'button' }));
      expect(() => naming.resolve('brand')).toThrow("color.foreground emits --acme-button, a name inside Button's component hooks");
    });

    test("or starts with a brand component's", () => {
      doc('brand', shared({ 'color.foreground': 'cta.button.ink' }, '  components:\n    Button: CtaButton\n'));
      expect(() => naming.resolve('brand')).toThrow("color.foreground emits --acme-cta-button-ink, a name inside CtaButton's component hooks");
    });

    test('with different prefixes the same path is fine', () => {
      doc('brand', `  namespace:\n    cssPrefix: acme\n  tokens:\n    cssPrefix: tok\n    rename:\n      color.foreground: button.ink\n`);
      expect(naming.resolve('brand').tokens).toEqual({ cssPrefix: 'tok', rename: { 'color.foreground': 'button.ink' } });
    });
  });

  test("the token build's loader runs the same checks and names the file and the key", () => {
    doc('brand', ACME);
    expect(loadTokenNaming('brand', dir)?.tokens).toEqual(naming.resolve('brand').tokens);
    doc('plain', '  namespace:\n    cssPrefix: acme\n');
    expect(loadTokenNaming('plain', dir), 'a doc with no tokens leaves the build on its default path').toBeNull();
    doc('bad', renaming({ 'color.nope': 'color.ink', 'color.foreground': 'color.scheme' }));
    expect(() => loadTokenNaming('bad', dir)).toThrow(/^✖ themes\/bad\/naming\.md: 2 token name problem\(s\):\n {4}tokens\.rename\.color\.nope: no token is called color\.nope\n {4}tokens\.rename\.color\.foreground: /);
    expect(() => loadTokenNaming('missing', dir)).toThrow("no naming doc for 'missing'");
    doc('invalid', '  tokens:\n    cssPrefix: --acme\n');
    expect(() => loadTokenNaming('invalid', dir)).toThrow('themes/invalid/naming.md does not match schema/naming.ts:\n    naming.tokens.cssPrefix:');
  });

  test('main prints the token rename count and the token prefix', () => {
    doc('brand', ACME);
    expect(naming.main(['--naming', 'brand', '--platform', 'web', '--dir', 'empty'])).toBe(0);
    expect(std.out()).toContain('0 value(s), 2 token rename(s), --acme- prefix, --acme- token prefix');
  });
});

describe('the codemod: emitted token names', () => {
  test('a CSS variable moves beside a component hook on the same line, and back', () => {
    const res = resolveDoc(ACME);
    const canonical = '.ds-button {\n  --ds-button-background: var(--color-action-primary-background);\n  gap: var(--space-2);\n}\n';
    const brand = '.acme-button {\n  --acme-button-background: var(--acme-color-brand-primary);\n  gap: var(--acme-space-2);\n}\n';
    expect(rw(canonical, res, 'web', 'Button.css')).toBe(brand);
    expect(rw(brand, res, 'web', 'Button.css', 'canonical')).toBe(canonical);
  });

  test("with the namespace's prefix, a token variable reverts to the token, never to --ds-", () => {
    const res = resolveDoc(ACME);
    expect(rw('color: var(--acme-color-foreground);\n', res, 'lit', 'Box.ts', 'canonical')).toBe('color: var(--color-foreground);\n');
    expect(rw('--acme-color-link-inverse: red;\n', res, 'web', 'theme.css', 'canonical')).toBe('--color-inverse-link: red;\n');
    expect(rw('--acme-box-padding: var(--acme-space-md);\n', res, 'web', 'Box.css', 'canonical')).toBe('--ds-box-padding: var(--space-md);\n');
  });

  test('a bare declaration and a variable in a TS string move too', () => {
    const res = resolveDoc(ACME);
    expect(rw('--color-foreground: #000;\n', res, 'web', 'tokens.css')).toBe('--acme-color-foreground: #000;\n');
    expect(rw("style.setProperty('--ds-box-gap', 'var(--space-md)');\n", res, 'web', 'Box.tsx')).toBe("style.setProperty('--acme-box-gap', 'var(--acme-space-md)');\n");
  });

  test('a dotted ref is never touched', () => {
    const res = resolveDoc(ACME);
    const text = "const a = cssVar('space.md');\nconst b: TokenRef = 'color.action.primary.background';\nresolveToken(t, 'color.inverse.link');\n";
    for (const platform of ['web', 'lit', 'rn']) expect(rw(text, res, platform, 'Box.tsx')).toBe(text);
  });

  test('a camel key moves as a member or a whole string literal on React Native, and nowhere else', () => {
    const res = resolveDoc(ACME);
    const canonical = "const V = { background: 'colorActionPrimaryBackground', fg: \"colorInverseLink\" };\nconst f = t.colorInverseLink ?? t.colorInverseFocus;\nconst colorInverseLink = 'a colorInverseLink';\n";
    const brand = "const V = { background: 'colorBrandPrimary', fg: \"colorLinkInverse\" };\nconst f = t.colorLinkInverse ?? t.colorInverseFocus;\nconst colorInverseLink = 'a colorInverseLink';\n";
    expect(rw(canonical, res, 'rn', 'Button.tsx')).toBe(brand);
    expect(rw(brand, res, 'rn', 'Button.tsx', 'canonical')).toBe(canonical);
    expect(rw(canonical, res, 'web', 'Button.tsx'), 'web reads tokens only through var(--…)').toBe(canonical);
  });

  test("and on SwiftUI, as a TokenRef case or a Theme accessor", () => {
    const res = resolveDoc(ACME);
    const canonical = 'let fill = theme.colorActionPrimaryBackground\nlet layer: TokenRef = .colorInverseLink\n';
    const brand = 'let fill = theme.colorBrandPrimary\nlet layer: TokenRef = .colorLinkInverse\n';
    expect(rw(canonical, res, 'swiftui', 'Button.swift')).toBe(brand);
    expect(rw(brand, res, 'swiftui', 'Button.swift', 'canonical')).toBe(canonical);
  });

  test('a doc without tokens rewrites byte for byte as it did before', () => {
    const plain = resolveDoc('  namespace:\n    cssPrefix: acme\n  components:\n    Button: CtaButton\n');
    doc('empty', '  namespace:\n    cssPrefix: acme\n  components:\n    Button: CtaButton\n  tokens: {}\n');
    const empty = naming.resolve('empty');
    for (const [platform, file] of [['web', 'Button.css'], ['web', 'Button.tsx'], ['rn', 'Button.tsx'], ['lit', 'Button.ts']] as const) {
      const text = readFileSync(join(sourceDir(REPO_ROOT, platform), file), 'utf8');
      const out = rw(text, plain, platform, file);
      expect(naming.vocab(plain, platform, 'brand').tokenCss.size).toBe(0);
      expect(rw(text, empty, platform, file)).toBe(out);
      if (file.endsWith('.css')) expect(out).toContain('var(--color-action-primary-background)');
      if (platform === 'rn') expect(out).toContain("'colorActionPrimaryBackground'");
    }
  });

  test('the committed Button.css and RN Button.tsx: brand, canonical restores byte for byte, brand again is the first apply', () => {
    const res = resolveDoc(ACME);
    const copies = { web: ['react', 'Button.css'], rn: ['rn', 'Button.tsx'] } as const;
    for (const [platform, [pkg, file]] of Object.entries(copies)) {
      const src = join(dir, 'sandbox', platform);
      mkdirSync(src, { recursive: true });
      cpSync(join(REPO_ROOT, 'packages', pkg, 'src', file), join(src, file));
      const read = (): string => readFileSync(join(src, file), 'utf8');
      const original = read();
      naming.rename(src, res, 'brand', platform);
      const brand = read();
      expect(brand).not.toBe(original);
      naming.rename(src, res, 'canonical', platform);
      expect(read()).toBe(original);
      naming.rename(src, res, 'brand', platform);
      expect(read()).toBe(brand);
      if (platform === 'web') {
        expect(brand).toContain('--acme-button-background: var(--acme-color-brand-primary);');
        expect(brand).toContain('var(--acme-space-2)');
        expect(brand).not.toMatch(/var\(--(?!acme-)/);
      } else {
        expect(brand).toContain("background: 'colorBrandPrimary',");
        expect(brand).toContain('t.colorLinkInverse');
        expect(brand).not.toContain('colorActionPrimaryBackground\'');
      }
    }
  });
});
