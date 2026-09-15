#!/usr/bin/env node
/**
 * naming.ts — a brand's names, resolved once per run and applied to the generated output.
 *
 *     node tools/naming.ts --naming nimbus --platform web              # what would change, write nothing
 *     node tools/naming.ts --naming nimbus --platform web,lit --apply  # canonical → brand names
 *     node tools/naming.ts --naming nimbus --platform web --revert     # brand → canonical names
 *
 * `themes/<brand>/naming.md` (schema/naming.ts, job 520) renames what the generators *emit*: the output
 * file name, the exported identifier, the prop names in the signature, and the CSS custom-property /
 * per-platform type prefix. It never touches the canonical schema, the prompt or the gates — the model
 * reads canonical component docs and writes canonical code, every gate (contrast, keyboard-spec
 * derivation, lint-literals, behavior tests, typecheck) runs on that canonical code, and this module is
 * the last step before the files are left on disk under the brand's names. See
 * site/src/content/docs/process/customization-and-naming.md.
 *
 * Activation is explicit: `tools/generate.ts --naming <brand|path>`, or `DS_NAMING=<brand>`. With neither,
 * `resolve(null)` is the unrenamed case, `isNoop` is true, and generate.ts never calls a rename at all —
 * so the default output is byte-identical to a run of the generator without this step.
 *
 * Because the gates read the package tree, a generation with naming active normalizes that tree back to
 * canonical names first (`rename(dir, res, 'canonical')`) and applies the brand names last (`'brand'`).
 * The maps are injective — schema/naming.ts rejects two canonical names renamed onto one brand name, and
 * `resolve` rejects a brand name that shadows another component — so the two directions are exact
 * inverses, and a fork's committed, renamed tree regenerates without a gate ever seeing a brand name.
 *
 * Resolution also checks the doc's keys against generated/components.json, because a naming map's key is
 * always the canonical name: a fork that pulls upstream and finds `Disclosure` renamed or a prop gone
 * gets a `NamingError` naming the stranded key, rather than a rename that quietly applies to nothing.
 * See site/src/content/docs/guides/updating-your-fork.md.
 *
 * What a rename touches
 *   - **File names.** `Button.tsx`, `Button.css`, `Button.stories.tsx`, `Button.test.tsx`,
 *     `Gallery+Button.swift` → the brand name, same extensions.
 *   - **Type identifiers.** Any PascalCase identifier whose leading segment is a renamed component:
 *     `Button`, `ButtonProps`, `ButtonVariant`, `ButtonOverridableBinding`. Plus the platform type names
 *     `namespace.typePrefix` covers: SwiftUI's generated `TokenRef` enum and the `DesignSchemaTokens`
 *     module holding it, React Native's theme context (`Theme`, `ThemeProvider`, `useTheme`).
 *   - **Prop and anatomy identifiers.** A bare key in `naming.props` renames that camelCase identifier
 *     everywhere; a dotted key (`Button.leadingIcon`) renames it inside that component's own generated
 *     files and inside its element's opening tag in a composite, and wins over the bare key there. Lit's
 *     attribute spelling follows: `attribute: 'leading-icon'`, an attribute written on a composed
 *     `<acme-cta-button>`, `slot="leading-icon"` and `<slot name="leading-icon">`.
 *   - **CSS.** `--ds-button-background` → `--acme-button-background`: the *prefix* only, because the rest
 *     of a hook name mirrors the canonical binding — themes/nimbus/naming.md promises exactly that
 *     ("custom properties come out as `--nimbus-button-background`… the rest of a token's name is
 *     untouched"). A class or custom-element name is the component's own spelling, so the component stem
 *     and any `__part` follow the rename there: `ds-button__label` → `acme-cta-button__label`,
 *     `<ds-button>` → `<acme-cta-button>`.
 *   - **The namespace prefix on an identifier.** Lit's element class `DsButton`, SwiftUI's `dsTheme`
 *     environment key: the prefix follows `cssPrefix` and the rest follows the component map, so
 *     `DsButton` → `AcmeCtaButton` and `dsTheme` → `acmeTheme` — never a second prefix on top of one.
 *   - **The package scope** in a module specifier: `@design-schema/tokens` → `@acme/tokens`. Renaming the
 *     packages themselves is the fork's own `package.json` edit — the generator never writes those.
 *   - **SwiftUI gallery symbols.** `buttonScreen` → `ctaButtonScreen`, matching `Gallery+CtaButton.swift`.
 *
 * What a rename never touches
 *   - The canonical gate hooks: `data-ds="Button"`, `data-part="leadingIcon"`, `part=`, `testID=` and
 *     `.accessibilityIdentifier("Button.label")`. tools/behavior_tests.ts and tools/keyboard_tests.ts
 *     derive their locators from the canonical docs and find a component through exactly these, which is
 *     what keeps those gates brand-agnostic; `data-ds` keeps its own `ds` for the same reason.
 *   - Anything imported from outside the system: every binding an external `import` introduces is
 *     protected for the whole file, so `Text as RNText`, `TextStyle` or `SwitchInstance` survive a
 *     `Text: Body` or `Switch: Toggle` rename untouched.
 *   - Everything under `packages/<pkg>/src/custom/`: hand-written extension modules, never the
 *     generator's to rewrite.
 *
 * Known limits, stated rather than hidden: a *dotted* prop rename reaches a composite only through the
 * opening tag of the renamed component's element (`<CtaButton variant=…>`), so a prop threaded through a
 * variable, a spread or a SwiftUI call site keeps its canonical spelling — a global prop rename has no
 * such limit. And a renamed tree is not a gateable tree: the derived behavior and keyboard tests are
 * written in canonical names, which is why a generation normalizes before it runs them.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import { namingDefaults, namingFrontmatter } from '../schema/naming.ts';
import type { NamingDef } from '../schema/naming.ts';
import { demoDir, isPlatform, PLATFORMS, sourceDir } from '../schema/platforms.ts';
import { pySorted, readText, sortedNames } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';
import { kebab, splitFrontmatter } from './parse.ts';

export const paths = {
  ROOT: REPO_ROOT,
  THEMES: join(REPO_ROOT, 'themes'),
  /** The canonical component list, for the one collision the schema cannot see on its own. */
  COMPONENTS: join(REPO_ROOT, 'generated', 'components.json'),
};

/** `sys.exit(message)` the way the tools spell it: a line for the operator, not a stack trace. */
export class NamingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamingError';
  }
}

/** Which way a rename runs: `brand` applies naming.md, `canonical` takes it back off. */
export type Direction = 'brand' | 'canonical';

/** One resolved naming doc, with every identity entry dropped so `isNoop` is a real question. */
export type Resolution = {
  /** The naming doc this came from, absolute; `null` is the unrenamed default. */
  source: string | null;
  naming: NamingDef;
  /** Canonical component name → brand name, renames only. */
  components: Record<string, string>;
  /** `variant` / `Button.variant` → brand name, renames only. */
  props: Record<string, string>;
  cssPrefix: string;
  package: string;
  typePrefix: Record<string, string>;
  /** Every canonical component name, when tools/parse.ts has run: `AlertDialog` must not follow
   *  `Alert: Callout`, so the names that are *not* renamed are as load-bearing as the ones that are. */
  canonical: string[];
};

/** Design Schema's own vocabulary: what a naming doc overrides, and what `canonical` renames back to. */
const CANONICAL = namingDefaults().namespace;

/** The platform type names `namespace.typePrefix` covers, canonical → prefixed. SwiftUI: the generated
 *  token enum and the module holding it. React Native: the theme context. */
export function prefixedTypes(platform: string, prefix: string): Record<string, string> {
  if (platform === 'swiftui') return { TokenRef: `${prefix}TokenRef`, DesignSchemaTokens: `${prefix}Tokens`, Theme: `${prefix}Theme` };
  if (platform === 'rn') return { Theme: `${prefix}Theme`, useTheme: `use${prefix}Theme` };
  return {};
}

// ---------------------------------------------------------------- resolving the doc

/** `nimbus` → themes/nimbus/naming.md; a path to a file is taken as written. */
export function namingDoc(ref: string): string {
  const direct = resolvePath(paths.ROOT, ref);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const byBrand = join(paths.THEMES, ref, 'naming.md');
  if (existsSync(byBrand)) return byBrand;
  throw new NamingError(`✖ no naming doc for '${ref}' — expected a file, or themes/${ref}/naming.md`);
}

/** What a naming doc's keys are checked against: the canonical component names, and for each one every
 *  name a `props` key may legally spell — its props, its anatomy parts and its events, extensions
 *  included, because tools/parse.ts has already merged those into the entry. */
export type CanonicalIndex = { names: string[]; members: Map<string, Set<string>> };

type ComponentEntry = {
  component?: { name?: string; props?: Record<string, unknown>; events?: Record<string, unknown>; anatomy?: string[] };
};

/** generated/components.json, read once; empty when tools/parse.ts has not run, which is the one
 *  state in which a naming doc's keys cannot be checked at all. */
export function canonicalIndex(): CanonicalIndex {
  if (!existsSync(paths.COMPONENTS)) return { names: [], members: new Map() };
  const entries = JSON.parse(readText(paths.COMPONENTS)) as ComponentEntry[];
  const names: string[] = [];
  const members = new Map<string, Set<string>>();
  for (const entry of entries) {
    const c = entry.component;
    const name = c?.name ?? '';
    if (name === '') continue;
    names.push(name);
    members.set(name, new Set([...Object.keys(c?.props ?? {}), ...Object.keys(c?.events ?? {}), ...(c?.anatomy ?? [])]));
  }
  return { names, members };
}

/** The canonical component names, when tools/parse.ts has been run; an empty list otherwise. */
export function canonicalComponents(): string[] {
  return canonicalIndex().names;
}

/**
 * Keys that name nothing in the canonical schema — the one way an upstream pull can still reach a
 * fork's naming doc.
 *
 * A naming map's *key* is always the canonical name (`Button: CtaButton`, never the reverse), which is
 * what makes this checkable: if upstream renames `Disclosure` to `Accordion` or drops a prop, the key
 * stops matching and the rename would otherwise apply to nothing at all — a silently unrenamed
 * component in a tree where every other one moved. Reported here so a pull fails loudly at the next
 * generation instead. See site/src/content/docs/guides/updating-your-fork.md.
 */
export function unknownKeys(naming: NamingDef, index: CanonicalIndex): string[] {
  if (index.names.length === 0) return []; // no components.json: nothing to check against, not "all stale"
  const out: string[] = [];
  const known = new Set(index.names);
  for (const key of pySorted(Object.keys(naming.components))) {
    if (!known.has(key)) out.push(`components.${key}: no canonical component is called ${key}`);
  }
  for (const key of pySorted(Object.keys(naming.props))) {
    const [scope, member] = key.includes('.') ? (key.split('.') as [string, string]) : ['', key];
    if (scope === '') {
      if (![...index.members.values()].some((m) => m.has(member))) {
        out.push(`props.${key}: no component has a prop, event or anatomy part called ${member}`);
      }
    } else if (!known.has(scope)) {
      out.push(`props.${key}: no canonical component is called ${scope}`);
    } else if (!(index.members.get(scope) as Set<string>).has(member)) {
      out.push(`props.${key}: ${scope} has no prop, event or anatomy part called ${member}`);
    }
  }
  return out;
}

/**
 * Resolve a naming doc once for a run. `null` — no `--naming`, no `DS_NAMING` — is the unrenamed case,
 * and the only one that reads nothing from disk.
 */
export function resolve(ref: string | null | undefined = null): Resolution {
  if (ref === null || ref === undefined || ref === '') {
    return {
      source: null, naming: namingDefaults(), components: {}, props: {},
      cssPrefix: CANONICAL.cssPrefix, package: CANONICAL.package, typePrefix: {}, canonical: [],
    };
  }
  const file = namingDoc(ref);
  const [fm] = splitFrontmatter(readText(file), file);
  const parsed = namingFrontmatter.safeParse(fm);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `    ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new NamingError(`✖ ${rel(file)} does not match schema/naming.ts:\n${issues}`);
  }
  const naming = parsed.data.naming;
  const components = renamesOnly(naming.components);
  const index = canonicalIndex();
  assertKnownKeys(naming, index, file);
  assertNoShadowing(components, index.names, file);
  return {
    source: file,
    naming,
    components,
    props: renamesOnly(naming.props),
    cssPrefix: naming.namespace.cssPrefix,
    package: naming.namespace.package,
    typePrefix: { ...naming.namespace.typePrefix },
    canonical: index.names,
  };
}

/** Prop renames a platform will not survive: a target that is already one of its own reserved prop
 *  names. Not an error — it is the brand's doc and its schema accepts it — but the renamed output will
 *  not typecheck, so every caller prints these before it writes anything. */
export function collisions(res: Resolution, platform: string): string[] {
  const reserved = platform === 'rn' ? RESERVED_RN : platform === 'web' ? RESERVED_WEB : platform === 'lit' ? RESERVED_WEB : [];
  const out: string[] = [];
  for (const [key, brand] of Object.entries(res.props)) {
    if (reserved.includes(brand)) out.push(`${key} → ${brand} collides with ${platform}'s own \`${brand}\` prop; the renamed output will not typecheck`);
  }
  return out;
}

const RESERVED_WEB: readonly string[] = ['style', 'className', 'children', 'key', 'ref', 'slot'];
const RESERVED_RN: readonly string[] = ['style', 'children', 'key', 'ref', 'testID'];

/** A doc that renames nothing: generate.ts skips the step entirely, so the output cannot move. */
export function isNoop(res: Resolution): boolean {
  return (
    Object.keys(res.components).length === 0 &&
    Object.keys(res.props).length === 0 &&
    Object.keys(res.typePrefix).length === 0 &&
    res.cssPrefix === CANONICAL.cssPrefix &&
    res.package === CANONICAL.package
  );
}

/** `{Button: 'Button', Alert: 'Callout'}` → `{Alert: 'Callout'}`: a name mapped to itself is not a rename. */
function renamesOnly(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [from, to] of Object.entries(map)) {
    const canonical = from.includes('.') ? (from.split('.')[1] as string) : from;
    if (canonical !== to) out[from] = to;
  }
  return out;
}

/**
 * A key that matches nothing stops the run, because the alternative is worse: the rename quietly does
 * less than the doc says, and a fork discovers one unrenamed component months later. The message names
 * a pull because that is nearly always what moved.
 */
function assertKnownKeys(naming: NamingDef, index: CanonicalIndex, file: string): void {
  const stale = unknownKeys(naming, index);
  if (stale.length === 0) return;
  throw new NamingError(
    `✖ ${rel(file)}: ${stale.length} key(s) name nothing in the canonical schema:\n` +
      stale.map((s) => `    ${s}\n`).join('') +
      "  A naming map's key is the canonical name, so an upstream rename or removal leaves it stranded.\n" +
      '  Point the key at the name upstream uses now, or drop it. If the schema is simply stale here,\n' +
      '  re-run `pnpm parse` to rebuild generated/components.json.',
  );
}

/**
 * The one collision schema/naming.ts cannot see on its own: a brand name that is already some *other*
 * canonical component's name. `Alert: Card` would write over Card's file and make the rename
 * non-invertible, so the run stops before it touches anything.
 */
function assertNoShadowing(components: Record<string, string>, canonical: string[], file: string): void {
  const renamed = new Set(Object.keys(components));
  for (const [from, to] of Object.entries(components)) {
    if (canonical.includes(to) && !renamed.has(to)) {
      throw new NamingError(`✖ ${rel(file)}: ${from} renames to ${to}, which is already a component — rename ${to} too, or pick another name`);
    }
  }
}

function rel(file: string): string {
  return (relative(paths.ROOT, file) || basename(file)).replaceAll('\\', '/');
}

// ---------------------------------------------------------------- the vocabulary of one rename

/** Everything the rewriter needs for one platform in one direction, precomputed once per folder. */
export type Vocab = {
  direction: Direction;
  platform: string;
  /** PascalCase component stems, longest first: `ButtonProps` → `CtaButtonProps`. */
  stems: [string, string][];
  /** The `namespace.typePrefix` names, which *add* a prefix — so they do not apply to a name that
   *  already carries one (`dsTheme` is `acmeTheme`, never `acmeAcmeTheme`). */
  typeStems: [string, string][];
  /** camelCase stems: the theme hook, and (SwiftUI) the gallery screen symbols. */
  camelStems: [string, string][];
  /** Scope (`''` global, a canonical component name otherwise) → source prop name → target prop name. */
  props: Map<string, Map<string, string>>;
  /** Source-side component name → canonical name, for the prop scope of a file or an element. */
  canonicalOf: Map<string, string>;
  /** Source kebab stem → target kebab stem, for class and custom-element names. */
  kebabs: [string, string][];
  cssFrom: string;
  cssTo: string;
  /** The namespace prefix as it appears on an identifier: Lit's `DsButton` class, SwiftUI's `dsTheme`
   *  environment key. `Ds` → `Nimbus`, and the component part of the name is renamed under it. */
  pascalFrom: string;
  pascalTo: string;
  camelFrom: string;
  camelTo: string;
  pkgFrom: string;
  pkgTo: string;
};

/** `ds` → `Ds`, `acme-ui` → `AcmeUi`: the namespace prefix, spelled as an identifier. */
export function pascalPrefix(cssPrefix: string): string {
  return cssPrefix.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/**
 * The maps for one direction; `canonical` is the exact inverse of `brand`.
 *
 * `reserved` is the other half of the component map: every component name that is *not* renamed, mapped
 * to itself and matched longest-first, so `Alert: Callout` leaves `AlertDialog` alone. It comes from the
 * canonical component list and from the file names in the folder being renamed, because a fork that has
 * not run tools/parse.ts still has the names on disk.
 */
export function vocab(res: Resolution, platform: string, direction: Direction, reserved: string[] = []): Vocab {
  const forward = direction === 'brand';
  const components: [string, string][] = Object.entries(res.components).map(([c, b]) => (forward ? [c, b] : [b, c]));
  const renamed = new Set(components.map(([from]) => from));
  const identities: [string, string][] = [...new Set([...res.canonical, ...reserved])]
    .filter((name) => /^[A-Z][A-Za-z0-9]*$/.test(name) && !renamed.has(name))
    .map((name): [string, string] => [name, name]);
  const prefix = res.typePrefix[platform];
  const types: [string, string][] = Object.entries(prefix === undefined ? {} : prefixedTypes(platform, prefix)).map(
    ([c, b]) => (forward ? [c, b] : [b, c]),
  );

  const props = new Map<string, Map<string, string>>();
  for (const [key, brand] of Object.entries(res.props)) {
    const dotted = key.includes('.');
    const scope = dotted ? (key.split('.')[0] as string) : '';
    const canonical = dotted ? (key.split('.')[1] as string) : key;
    const bucket = props.get(scope) ?? new Map<string, string>();
    bucket.set(forward ? canonical : brand, forward ? brand : canonical);
    props.set(scope, bucket);
  }

  const canonicalOf = new Map<string, string>();
  for (const [canonical, brand] of Object.entries(res.components)) canonicalOf.set(forward ? canonical : brand, canonical);

  const byLength = (a: [string, string], b: [string, string]): number => b[0].length - a[0].length;
  return {
    direction,
    platform,
    stems: [...components, ...identities].sort(byLength),
    typeStems: types.filter(([from]) => /^[A-Z]/.test(from)).sort(byLength),
    camelStems: types.filter(([from]) => /^[a-z]/.test(from)).sort(byLength),
    props,
    canonicalOf,
    kebabs: [...components, ...identities].map(([from, to]): [string, string] => [kebab(from), kebab(to)]).sort(byLength),
    cssFrom: forward ? CANONICAL.cssPrefix : res.cssPrefix,
    cssTo: forward ? res.cssPrefix : CANONICAL.cssPrefix,
    pascalFrom: pascalPrefix(forward ? CANONICAL.cssPrefix : res.cssPrefix),
    pascalTo: pascalPrefix(forward ? res.cssPrefix : CANONICAL.cssPrefix),
    camelFrom: lower(pascalPrefix(forward ? CANONICAL.cssPrefix : res.cssPrefix)),
    camelTo: lower(pascalPrefix(forward ? res.cssPrefix : CANONICAL.cssPrefix)),
    pkgFrom: forward ? CANONICAL.package : res.package,
    pkgTo: forward ? res.package : CANONICAL.package,
  };
}

// ---------------------------------------------------------------- rewriting one file

/** Word boundaries that treat `-` as part of the word, so `size` never matches inside `font-size`. */
const BEFORE = String.raw`(?<![A-Za-z0-9_$-])`;
const AFTER = String.raw`(?![A-Za-z0-9_$-])`;
const QUOTED = '(?:"[^"\\n]*"|\'[^\'\\n]*\'|`[^`\\n]*`)';

/** The hooks the gates find a component through: their value is the canonical name, always — written as
 *  an attribute (`data-ds="Button"`, `testID={cond ? 'Table.cell' : …}`), as a call
 *  (`.accessibilityIdentifier("Button.label")`) or through `setAttribute`, as Lit sets it. */
const HOOK_NAMES = '(?:data-ds|data-part|part|testID|accessibilityIdentifier)';
const BRACED = String.raw`\{(?:[^{}\n]|\$\{[^{}\n]*\})*\}`;
const GATE_HOOK = new RegExp(
  [
    String.raw`${HOOK_NAMES}\s*[=:(]\s*(?:${BRACED}|${QUOTED})`,
    String.raw`setAttribute\(\s*['"]data-(?:ds|part)['"]\s*,\s*${QUOTED}`,
  ].join('|'),
);

/** An import that brings bindings in from outside the system; every name in its clause is off-limits. */
const IMPORT = /^[ \t]*(?:import|export)\s+(?:type\s+)?((?:[^;'"\n]|\n(?!\s*\n))*?)\s*from\s*['"]([^'"\n]+)['"]/gm;

/** An opening tag, for the prop scope of an element: bounded by the first `>`, quoted values aside. */
const OPEN_TAG = /<([A-Za-z][A-Za-z0-9._-]*)(?:[^>'"]|'[^'\n]*'|"[^"\n]*")*>/g;

export type FileKind = 'ts' | 'css' | 'swift' | 'other';

export function fileKind(file: string): FileKind {
  const name = basename(file);
  if (/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(name)) return 'ts';
  if (name.endsWith('.css')) return 'css';
  if (name.endsWith('.swift')) return 'swift';
  return 'other';
}

/** The component a file belongs to, source-side: `Button.stories.tsx` → `Button`,
 *  `Gallery+Button.swift` → `Button`, `index.ts` → `index` (a scope no prop map has). */
export function fileStem(file: string): string {
  const stem = basename(file).split('.')[0] as string;
  return stem.includes('+') ? stem.slice(stem.lastIndexOf('+') + 1) : stem;
}

/**
 * What an external import puts out of reach. Its *local bindings* are protected for the whole file —
 * `TextStyle` is react-native's type wherever it appears, so a `Text: Body` rename must not touch it —
 * and the import statement itself is protected as a range, so the left half of `Text as RNText` keeps
 * the name the external module exports while `Text` elsewhere in the file is still the system's own.
 */
export function externalImports(text: string, kind: FileKind, v: Vocab): { bindings: Set<string>; ranges: { start: number; end: number }[] } {
  const bindings = new Set<string>();
  const ranges: { start: number; end: number }[] = [];
  if (kind !== 'ts') return { bindings, ranges };
  for (const m of text.matchAll(IMPORT)) {
    const spec = m[2] as string;
    if (spec.startsWith('.') || spec === v.pkgFrom || spec.startsWith(`${v.pkgFrom}/`)) continue;
    ranges.push({ start: m.index as number, end: (m.index as number) + m[0].length });
    for (const piece of (m[1] as string).split(/[,{}]/)) {
      // the local binding is the name after `as`, or the only name there
      const words = piece.split(/\s+as\s+/);
      const id = (words[words.length - 1] as string).replace(/\btype\b|\*/g, ' ').trim();
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(id)) bindings.add(id);
    }
  }
  return { bindings, ranges };
}

/** The element scopes in a file: where `<CtaButton …>` or `<acme-cta-button …>` opens, and for which
 *  canonical component, so a dotted prop rename reaches a composite's markup. */
export function tagScopes(text: string, v: Vocab): { start: number; end: number; scope: string }[] {
  const out: { start: number; end: number; scope: string }[] = [];
  for (const m of text.matchAll(OPEN_TAG)) {
    const tag = m[1] as string;
    const scope = /^[A-Z]/.test(tag) ? v.canonicalOf.get(tag) : canonicalOfTag(tag, v);
    if (scope !== undefined) out.push({ start: (m.index as number) + 1 + tag.length, end: (m.index as number) + m[0].length, scope });
  }
  return out;
}

/** `acme-cta-button` → `Button`: the custom-element spelling of a renamed component. */
function canonicalOfTag(tag: string, v: Vocab): string | undefined {
  if (!tag.startsWith(`${v.cssFrom}-`)) return undefined;
  const stem = tag.slice(v.cssFrom.length + 1);
  for (const [name, canonical] of v.canonicalOf) {
    if (kebab(name) === stem) return canonical;
  }
  return undefined;
}

function camelOf(kebabName: string): string {
  return kebabName.replace(/-([a-z0-9])/g, (_m, c: string) => c.toUpperCase());
}

/**
 * One generated file's text, renamed. The scan is a single ordered alternation walked once, so every
 * position is rewritten at most once and a gate hook wins over any rule that would match inside it.
 */
export function rewrite(text: string, v: Vocab, file: string): string {
  const kind = fileKind(file);
  const { bindings: protectedIdents, ranges: protectedRanges } = externalImports(text, kind, v);
  const scopes = v.props.size > 0 ? tagScopes(text, v) : [];
  const stem = fileStem(file);
  const ownScope = v.canonicalOf.get(stem) ?? stem;

  const scan = new RegExp(
    [
      GATE_HOOK.source,
      // `::part(label)` pairs with the `part="label"` hook above, so it stays canonical too
      String.raw`::part\([^)\n]*\)`,
      // a css custom property, class name or custom-element name carrying the namespace prefix
      `${BEFORE}(?:--)?${escape(v.cssFrom)}-[a-z0-9][A-Za-z0-9_-]*`,
      // the package scope in a module specifier
      `${escape(v.pkgFrom)}(?=/)`,
      // lit's explicit attribute name, and the two slot spellings of an anatomy part
      String.raw`attribute:\s*'[a-z][a-z0-9-]*'`,
      String.raw`<slot\s+name=(?:"[a-z][a-z0-9-]*"|'[a-z][a-z0-9-]*')`,
      String.raw`\bslot=(?:"[a-z][a-z0-9-]*"|'[a-z][a-z0-9-]*')`,
      // an identifier: Pascal for a type, camel for a prop
      `${BEFORE}[A-Z][A-Za-z0-9]*`,
      `${BEFORE}[a-z][A-Za-z0-9]*${AFTER}`,
      // a kebab attribute name, in an attribute position only
      `${BEFORE}[a-z][a-z0-9]*(?:-[a-z0-9]+)+(?=\\s*=)`,
    ].join('|'),
    'g',
  );

  const scopeAt = (index: number): string => {
    for (const s of scopes) if (index >= s.start && index < s.end) return s.scope;
    return ownScope;
  };
  const propAt = (id: string, index: number): string | null => {
    const scope = scopeAt(index);
    return v.props.get(scope)?.get(id) ?? v.props.get('')?.get(id) ?? null;
  };
  const kebabPropAt = (name: string, index: number): string | null => {
    const renamed = propAt(camelOf(name), index);
    return renamed === null ? null : kebab(renamed);
  };

  let out = '';
  let at = 0;
  const external = (index: number): boolean => protectedRanges.some((r) => index >= r.start && index < r.end);
  for (const m of text.matchAll(scan)) {
    const match = m[0];
    const index = m.index as number;
    out += text.slice(at, index) + (external(index) ? match : replacement(match, index, v, kind, protectedIdents, propAt, kebabPropAt));
    at = index + match.length;
  }
  return out + text.slice(at);
}

/** One matched token, renamed — the ordered rules of `rewrite`'s alternation, in the same order. */
function replacement(
  match: string,
  index: number,
  v: Vocab,
  kind: FileKind,
  protectedIdents: Set<string>,
  propAt: (id: string, index: number) => string | null,
  kebabPropAt: (name: string, index: number) => string | null,
): string {
  if (match.startsWith('::part(') || GATE_HOOK.test(match)) return match; // a canonical gate hook, value and all
  if (match === v.pkgFrom) return v.pkgTo;
  if (match.startsWith('attribute:') || match.startsWith('<slot') || match.startsWith('slot=')) {
    return replaceQuoted(match, (name) => kebabPropAt(name, index) ?? name);
  }
  if (match.startsWith('--') || match.startsWith(`${v.cssFrom}-`)) return renameCssName(match, v, index, kebabPropAt);
  if (/^[A-Z]/.test(match)) return protectedIdents.has(match) ? match : renamePascal(match, v);
  // In a stylesheet a bare word is a CSS property or keyword, never a prop: `gap:` is not `Stack.gap`.
  // A prop's spelling in CSS only ever shows up in a class name, which `renameCssName` has already done.
  if (kind === 'css') return match;
  if (match.includes('-')) return kebabPropAt(match, index) ?? match;
  if (protectedIdents.has(match)) return match;
  return propAt(match, index) ?? renameCamel(match, v);
}

/** The quoted value inside a matched attribute form, rewritten by `f`. */
function replaceQuoted(match: string, f: (value: string) => string): string {
  return match.replace(/(['"])([^'"]*)\1/, (_m, q: string, value: string) => `${q}${f(value)}${q}`);
}

/**
 * A dashed name carrying the namespace prefix. A custom property takes the new prefix and nothing else —
 * the rest of a hook name mirrors the canonical binding, which is what themes/nimbus/naming.md promises.
 * A class or custom-element name is the component's own spelling, so its stem and `__part` follow too.
 */
function renameCssName(match: string, v: Vocab, index: number, kebabPropAt: (name: string, index: number) => string | null): string {
  const custom = match.startsWith('--');
  const rest = (custom ? match.slice(2) : match).slice(v.cssFrom.length + 1);
  if (custom) return `--${v.cssTo}-${rest}`;
  const modifier = rest.indexOf('--');
  const head = modifier === -1 ? rest : rest.slice(0, modifier);
  const tail = modifier === -1 ? '' : rest.slice(modifier);
  const under = head.indexOf('__');
  let stem = under === -1 ? head : head.slice(0, under);
  const part = under === -1 ? '' : head.slice(under + 2);
  for (const [from, to] of v.kebabs) {
    if (stem === from || stem.startsWith(`${from}-`)) {
      stem = to + stem.slice(from.length);
      break;
    }
  }
  const renamedPart = part === '' ? '' : `__${kebabPropAt(part, index) ?? part}`;
  return `${v.cssTo}-${stem}${renamedPart}${tail}`;
}

/** `ButtonProps` → `CtaButtonProps`, `DsButton` → `NimbusCtaButton`: the namespace prefix if the name
 *  carries one, then the longest component stem whose remainder starts a new word. */
function renamePascal(id: string, v: Vocab): string {
  // A platform type name first: `AcmeTheme` is the prefixed `Theme`, not the namespace prefix on `Theme`,
  // and the two are indistinguishable when a brand's typePrefix and cssPrefix agree (they usually do).
  const byType = stemmed(id, v.typeStems);
  if (byType !== null) return byType;
  if (id.startsWith(v.pascalFrom) && /^[A-Z]/.test(id.charAt(v.pascalFrom.length))) {
    return v.pascalTo + (stemmed(id.slice(v.pascalFrom.length), v.stems) ?? id.slice(v.pascalFrom.length));
  }
  return stemmed(id, v.stems) ?? id;
}

/** The longest stem whose remainder starts a new word, applied; null if none matches. */
function stemmed(id: string, stems: [string, string][]): string | null {
  for (const [from, to] of stems) {
    if (id === from) return to;
    if (id.startsWith(from) && /^[A-Z]/.test(id.charAt(from.length))) return to + id.slice(from.length);
  }
  return null;
}

/** `useTheme` → `useNimbusTheme`, `dsTheme` → `nimbusTheme`, `buttonScreen` → `ctaButtonScreen`. */
function renameCamel(id: string, v: Vocab): string {
  const byStem = stemmed(id, v.camelStems);
  if (byStem !== null) return byStem;
  if (id.startsWith(v.camelFrom) && /^[A-Z]/.test(id.charAt(v.camelFrom.length))) {
    const rest = id.slice(v.camelFrom.length);
    return v.camelTo + (stemmed(rest, v.stems) ?? rest);
  }
  if (v.platform === 'swiftui' && id.endsWith('Screen')) {
    const head = id.slice(0, -'Screen'.length);
    for (const [from, to] of v.stems) {
      if (lower(from) === head) return `${lower(to)}Screen`;
    }
  }
  return id;
}

function lower(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** `Button.stories.tsx` → `CtaButton.stories.tsx`, `Gallery+Button.swift` → `Gallery+CtaButton.swift`. */
export function renameFileName(name: string, v: Vocab): string {
  return name.replace(new RegExp(`${BEFORE}[A-Z][A-Za-z0-9]*`, 'g'), (id) => renamePascal(id, v));
}

// ---------------------------------------------------------------- applying it to a tree

/** What a rename did: the files whose text changed, and the files that moved. */
export type Applied = { edited: string[]; renames: [from: string, to: string][] };

/** Folders a generated file never lives in, and the one folder that is hand-written. */
const SKIP_DIRS: ReadonlySet<string> = new Set(['custom', 'node_modules', 'dist', '__snapshots__']);

function walk(dir: string, out: string[] = []): string[] {
  for (const e of sortedNames(readdirSync(dir))) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(e)) walk(full, out);
    } else out.push(full);
  }
  return out;
}

/**
 * Rename one folder of generated code in place. Idempotent in both directions: `brand` twice changes
 * nothing the second time, and `canonical` afterwards restores exactly the bytes that were there before.
 */
export function rename(dir: string, res: Resolution, direction: Direction, platform: string, dryRun: boolean = false): Applied {
  const applied: Applied = { edited: [], renames: [] };
  if (isNoop(res) || !existsSync(dir)) return applied;
  const files = walk(dir);
  const v = vocab(res, platform, direction, files.map((f) => fileStem(f)));
  for (const file of files) {
    const kind = fileKind(file);
    const before = kind === 'other' ? '' : readFileSync(file, 'utf8');
    const after = kind === 'other' ? '' : rewrite(before, v, file);
    const target = join(dirname(file), renameFileName(basename(file), v));
    const key = (f: string): string => relative(dir, f).replaceAll('\\', '/');
    if (after !== before) applied.edited.push(key(file));
    if (target !== file) applied.renames.push([key(file), key(target)]);
    if (dryRun) continue;
    if (target === file) {
      if (after !== before) writeFileSync(file, after, 'utf8');
    } else if (kind === 'other') {
      renameSync(file, target);
    } else {
      // Write the new file first, then drop the old: a crash between the two leaves both, never neither.
      writeFileSync(target, after, 'utf8');
      if (existsSync(file)) unlinkSync(file);
    }
  }
  applied.edited = pySorted(applied.edited);
  applied.renames.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return applied;
}

/** `packages/react/src/Button.tsx` → its renamed path, for the lockfile's file list. */
export function renamePath(relPath: string, res: Resolution, platform: string, direction: Direction = 'brand'): string {
  if (isNoop(res)) return relPath;
  const v = vocab(res, platform, direction);
  const parts = relPath.replaceAll('\\', '/').split('/');
  parts[parts.length - 1] = renameFileName(parts[parts.length - 1] as string, v);
  return parts.join('/');
}

/** Where a platform's generated code lives: the package source, and the pattern demo pages beside it. */
export function generatedDirs(platform: string, root: string = paths.ROOT): string[] {
  const dirs = [sourceDir(root, platform)];
  const demo = demoDir(root, platform);
  if (demo !== null) dirs.push(demo);
  return dirs.filter((d) => existsSync(d));
}

// ---------------------------------------------------------------- command line

const USAGE = `usage: naming.ts --naming BRAND|PATH [--platform ${PLATFORMS.join(',')}]
                 [--check | --apply | --revert] [--dir DIR]`;

const HELP = `${USAGE}

Resolve themes/<brand>/naming.md and rename a platform's generated output — the step
tools/generate.ts runs for you when it is given --naming.

options:
  -h, --help         show this help message and exit
  --naming BRAND     a brand under themes/, or a path to a naming doc
  --platform LIST    comma-separated: ${PLATFORMS.join(',')} (default: all of them)
  --check            print what would change, write nothing (the default)
  --apply            canonical → brand names
  --revert           brand → canonical names
  --dir DIR          rename this folder instead of the platform's package source
`;

export function main(argv: string[] = process.argv.slice(2)): number {
  let ref: string | null = null;
  let platforms = PLATFORMS.join(',');
  let mode: Direction | 'check' = 'check';
  let dir: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    const value = (): string => {
      const v = argv[i + 1];
      if (v === undefined) throw new NamingError(`${USAGE}\nnaming.ts: error: argument ${arg}: expected one argument`);
      i += 1;
      return v;
    };
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(HELP);
      return 0;
    } else if (arg === '--naming') ref = value();
    else if (arg === '--platform') platforms = value();
    else if (arg === '--dir') dir = value();
    else if (arg === '--check') mode = 'check';
    else if (arg === '--apply') mode = 'brand';
    else if (arg === '--revert') mode = 'canonical';
    else {
      process.stderr.write(`${USAGE}\nnaming.ts: error: unrecognized arguments: ${arg}\n`);
      return 2;
    }
  }
  if (ref === null) {
    process.stderr.write(`${USAGE}\nnaming.ts: error: --naming is required\n`);
    return 2;
  }
  const res = resolve(ref);
  process.stdout.write(
    `naming ${rel(res.source as string)}: ${Object.keys(res.components).length} component(s), ${Object.keys(res.props).length} prop(s), --${res.cssPrefix}- prefix\n`,
  );
  if (isNoop(res)) {
    process.stdout.write('the doc renames nothing — no-op\n');
    return 0;
  }
  const direction: Direction = mode === 'canonical' ? 'canonical' : 'brand';
  const verb = mode === 'check' ? 'would change' : direction === 'brand' ? 'renamed' : 'reverted';
  for (const platform of platforms.split(',').map((p) => p.trim()).filter((p) => p !== '')) {
    if (!isPlatform(platform)) {
      process.stderr.write(`unknown platform ${platform}\n`);
      return 2;
    }
    for (const warning of collisions(res, platform)) process.stdout.write(`  ! ${platform}: ${warning}\n`);
    for (const folder of dir === null ? generatedDirs(platform) : [resolvePath(paths.ROOT, dir)]) {
      const applied = rename(folder, res, direction, platform, mode === 'check');
      process.stdout.write(`  ${platform} ${rel(folder)}: ${verb} ${applied.edited.length} file(s), ${applied.renames.length} move(s)\n`);
      for (const [from, to] of applied.renames.slice(0, 12)) process.stdout.write(`      ${from} → ${to}\n`);
      if (applied.renames.length > 12) process.stdout.write(`      … ${applied.renames.length - 12} more\n`);
    }
  }
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolvePath(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    process.exitCode = main();
  } catch (e) {
    process.stderr.write(`${e instanceof Error ? e.message : String(e)}\n`);
    process.exitCode = 1;
  }
}
