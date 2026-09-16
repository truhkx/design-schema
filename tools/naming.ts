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
 *   - **Prop identifiers.** A bare key in `naming.props` renames that camelCase identifier
 *     everywhere; a dotted key (`Button.leadingIcon`) renames it inside that component's own generated
 *     files and inside its element's opening tag in a composite, and wins over the bare key there. Lit's
 *     attribute spelling follows: `attribute: 'leading-icon'`, an attribute written on a composed
 *     `<acme-cta-button>`, and — unless `naming.anatomy` names the part — `slot="leading-icon"` and
 *     `<slot name="leading-icon">`.
 *   - **Event names, as each platform emits them.** `naming.events` is keyed by the neutral name
 *     (`Button.onPress`) and renames what generated code emits (`eventDef.platforms`): on web and React
 *     Native the identifier (`onClick`, `onPress`) in the component's own files and as an attribute on
 *     its element in a composite — never on an intrinsic `<button>` or an imported `<Pressable>`, whose
 *     `onClick`/`onPress` are their own; on Lit the quoted name in `new CustomEvent(…)` and
 *     `add`/`removeEventListener(…)` in its own files, and `@press=` on its element in a composite.
 *   - **Anatomy parts.** `naming.anatomy` renames a part's own spellings only — the class `__part`
 *     segment, `slot="…"`, `<slot name="…">` and a `slot[name='…']` selector — never an identifier, so
 *     Button's `trailingIcon` prop keeps its name when its part is renamed.
 *   - **CSS.** `--ds-button-background` → `--acme-button-background`: the *prefix* only, because the rest
 *     of a hook name mirrors the canonical binding — themes/nimbus/naming.md promises exactly that
 *     ("custom properties come out as `--nimbus-button-background`"). A class or custom-element name is
 *     the component's own spelling, so the component stem and any `__part` follow the rename there:
 *     `ds-button__label` → `acme-cta-button__label`, `<ds-button>` → `<acme-cta-button>`.
 *   - **Emitted token names**, only under a `tokens` block (job 628): a token's CSS variable in `var(--…)`
 *     and bare `--…` positions (`--color-action-primary-background` → `--acme-color-brand-primary`), and on
 *     TOKEN_KEY_PLATFORMS its camel key as a member (`t.colorInverseLink`) or a whole string literal
 *     (`'colorActionPrimaryBackground'`). Matched by exact membership in the names tools/lib/tokens.ts's
 *     `emittedCssName` and `emittedCamelName` give each manifest token, and tried before the namespace
 *     rule: with `tokens.cssPrefix` equal to `namespace.cssPrefix`, a reverted `--acme-color-foreground`
 *     is `--color-foreground`, never `--ds-color-foreground`.
 *   - **The namespace prefix on an identifier.** Lit's element class `DsButton`, SwiftUI's `dsTheme`
 *     environment key: the prefix follows `cssPrefix` and the rest follows the component map, so
 *     `DsButton` → `AcmeCtaButton` and `dsTheme` → `acmeTheme` — never a second prefix on top of one.
 *   - **The package scope** in a module specifier: `@design-schema/tokens` → `@acme/tokens`. Renaming the
 *     packages themselves is the fork's own `package.json` edit — the generator never writes those.
 *   - **SwiftUI gallery symbols.** `buttonScreen` → `ctaButtonScreen`, matching `Gallery+CtaButton.swift`.
 *   - **Enum values.** `naming.values` (`Button.variant: { primary: cta }`) renames a value only where the code
 *     ties it to one prop: an attribute on the component's element, a Lit attribute selector, an object
 *     property or JSON key, a default, a comparison or `case` on the prop, a `ButtonVariant` union or the
 *     prop's own declaration, a `ds-button--primary` modifier class, an object literal or SwiftUI enum whose
 *     keys are exactly the prop's values (and no sibling prop's), and `case .primary` inside `switch variant`.
 *     A quoted literal equal to a renamed value that none of those claims, or a prop interpolated into a
 *     token name, is left alone in both directions and reported in `Applied.ambiguous`.
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
 *   - A value inside a token reference or a comment: `var(--color-action-primary-background)`,
 *     `'colorActionPrimaryBackground'`, `color.action.primary.background`, "Use the `primary` variant". Token
 *     paths are canonical, and a theme keys off them. A dotted ref (`cssVar('space.md')`) never moves, even
 *     under `tokens`, which moves only the emitted names above.
 *
 * Known limits, stated rather than hidden: a *dotted* prop rename reaches a composite only through the
 * opening tag of the renamed component's element (`<CtaButton variant=…>`), so a prop threaded through a
 * variable, a spread or a SwiftUI call site keeps its canonical spelling — a global prop rename has no
 * such limit. An event rename has the same element-only reach, and on Lit a composite that listens for a
 * renamed component's event other than on its element — `addEventListener('press', …)`, or `@press=` on
 * an ancestor, as Form does — keeps the canonical name. And a renamed tree is not a gateable tree: the derived behavior and keyboard tests are
 * written in canonical names, which is why a generation normalizes before it runs them.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALIAS_SUPPORT, EVENT_RENAME_PLATFORMS, namingDefaults, namingFrontmatter, TYPE_PREFIX_PLATFORMS } from '../schema/naming.ts';
import type { AliasEntry, NamingDef } from '../schema/naming.ts';
import { demoDir, isPlatform, PLATFORMS, sourceDir } from '../schema/platforms.ts';
import { TOKEN_NAMES } from '../schema/tokens.ts';
import { enumValues } from '../schema/vocab.ts';
import { pySorted, readText, sortedNames } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';
import { findNamingDoc, renamesTokens, tokenProblems, tokenRenames, unknownTokenKeys } from './lib/token_naming.ts';
import type { TokenRenames } from './lib/token_naming.ts';
import { camelName, cssName, emittedCamelName, emittedCssName } from './lib/tokens.ts';
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
  /** Per platform (web, lit, rn): scope → canonical emitted event name → brand emitted name, renames only.
   *  The scope is a canonical component — a bare `events` key is spread onto every component with the
   *  event, because what it emits differs per component — or `''` when there is no components.json. */
  events: Record<string, Record<string, Record<string, string>>>;
  /** Scope (`''` global, a canonical component name otherwise) → canonical anatomy part → brand part, renames only. */
  anatomy: Record<string, Record<string, string>>;
  /** Scope → canonical enum prop → canonical value → brand value, renames only. With components.json a bare
   *  `values` key is merged into every component whose prop has the value, under its dotted key, so the scope
   *  is always a component; without one the key's own scope is all there is. */
  values: Record<string, Record<string, Record<string, string>>>;
  /** Every canonical enum prop's values, for each component a value rename reaches: the object-literal, modifier
   *  class and SwiftUI enum rules need a prop's full set, and its siblings' to rule out an ambiguous match. */
  enums: Record<string, Record<string, string[]>>;
  cssPrefix: string;
  package: string;
  typePrefix: Record<string, string>;
  /** Every canonical component name, when tools/parse.ts has run: `AlertDialog` must not follow
   *  `Alert: Callout`, so the names that are *not* renamed are as load-bearing as the ones that are. */
  canonical: string[];
  /** Canonical component → the old names the compatibility layer keeps working for it, resolved to current names.
   *  Empty without an `aliases` block. */
  aliases: Record<string, CompatAliases>;
  /** The doc's `tokens` block with identity renames dropped: the names the token build emits, which `rewrite` moves. */
  tokens: TokenRenames;
};

/** One alias entry, and where the doc wrote it (`aliases.props.Button.variant[0]`), for every message about it. */
export type AliasUse = { label: string; entry: AliasEntry };

/** One component's aliases, in the names naming-compat/ has to write: `current` is the component's name after the
 *  rename, and each aliased prop and value carries its current spelling beside the canonical one. */
export type CompatAliases = {
  current: string;
  components: AliasUse[];
  props: { prop: string; current: string; aliases: AliasUse[] }[];
  values: { prop: string; currentProp: string; value: string; current: string; aliases: AliasUse[] }[];
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

/** The platforms whose generated code reads a token by its camel key, so a `tokens` rename has to reach it there:
 *  React Native's `t.colorInverseLink` and `'colorActionPrimaryBackground'`, SwiftUI's `.layerToast`. Web and Lit
 *  read tokens only through `var(--…)` and dotted refs. */
export const TOKEN_KEY_PLATFORMS = ['rn', 'swiftui'] as const;

// ---------------------------------------------------------------- resolving the doc

/** `nimbus` → themes/nimbus/naming.md; a path to a file is taken as written. */
export function namingDoc(ref: string): string {
  const file = findNamingDoc(ref, paths.ROOT, paths.THEMES);
  if (file === null) throw new NamingError(`✖ no naming doc for '${ref}' — expected a file, or themes/${ref}/naming.md`);
  return file;
}

/** What a naming doc's keys are checked against: the canonical component names, and for each one every
 *  name a `props` key may legally spell — its props, its anatomy parts and its events, extensions
 *  included, because tools/parse.ts has already merged those into the entry. The same names split by kind
 *  are what the `events` and `anatomy` maps check against, and what tells a `props` key that names only
 *  an event or only a part (see `notices`) from one that names a prop. */
export type CanonicalIndex = {
  names: string[];
  members: Map<string, Set<string>>;
  props: Map<string, Set<string>>;
  /** Component → neutral event name → its `eventDef.platforms` record: what each platform emits. */
  events: Map<string, Map<string, Record<string, string>>>;
  anatomy: Map<string, Set<string>>;
  /** Component → enum prop → its values: `values` as tools/parse.ts wrote them, or its `enumRef` vocabulary. */
  enums: Map<string, Map<string, readonly string[]>>;
};

type ComponentEntry = {
  component?: {
    name?: string;
    props?: Record<string, { type?: string; values?: string[]; enumRef?: string } | undefined>;
    events?: Record<string, { platforms?: Record<string, string> } | undefined>;
    anatomy?: string[];
  };
};

/** generated/components.json, read once; empty when tools/parse.ts has not run, which is the one
 *  state in which a naming doc's keys cannot be checked at all. */
export function canonicalIndex(): CanonicalIndex {
  const index: CanonicalIndex = { names: [], members: new Map(), props: new Map(), events: new Map(), anatomy: new Map(), enums: new Map() };
  if (!existsSync(paths.COMPONENTS)) return index;
  const entries = JSON.parse(readText(paths.COMPONENTS)) as ComponentEntry[];
  for (const entry of entries) {
    const c = entry.component;
    const name = c?.name ?? '';
    if (name === '') continue;
    const props = Object.keys(c?.props ?? {});
    const events = new Map(Object.entries(c?.events ?? {}).map(([e, def]): [string, Record<string, string>] => [e, { ...(def?.platforms ?? {}) }]));
    const anatomy = c?.anatomy ?? [];
    index.names.push(name);
    index.members.set(name, new Set([...props, ...events.keys(), ...anatomy]));
    index.props.set(name, new Set(props));
    index.events.set(name, events);
    index.anatomy.set(name, new Set(anatomy));
    const enums = Object.entries(c?.props ?? {}).filter(([, def]) => def?.type === 'enum');
    index.enums.set(name, new Map(enums.map(([p, def]): [string, readonly string[]] => [p, enumValues(def ?? {})])));
  }
  return index;
}

/** `Button.variant` → `['Button', 'variant']`, `variant` → `['', 'variant']`. */
function splitKey(key: string): [scope: string, member: string] {
  return key.includes('.') ? (key.split('.') as [string, string]) : ['', key];
}

/** `onOpenChange` as a platform emits it by convention: web and React Native as written, Lit without the
 *  `on`, kebab-cased (`open-change`). The canonical docs follow it except where a platform's own API
 *  wins (Button's `onClick` on web, React Native's `onChangeText`), which is why a string rename checks. */
export function conventionalEmitted(neutral: string, platform: string): string {
  return platform === 'lit' ? kebab(neutral.slice(2)) : neutral;
}

/** Whether a platform's emitted event name is one a rename can reach: an identifier on web and React
 *  Native, a CustomEvent name on Lit. A mapping written as prose (`focus (native, retargeted — …)`) is not. */
function emitsName(platform: string, emitted: string | undefined): emitted is string {
  if (emitted === undefined) return false;
  return platform === 'lit' ? /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(emitted) : /^[a-z][A-Za-z0-9]*$/.test(emitted);
}

/** The components an `events` key reaches: its own, or for a bare key every component with that event
 *  that has no dotted key of its own, since the dotted key wins. */
function eventOwners(naming: NamingDef, index: CanonicalIndex, scope: string, member: string): string[] {
  if (scope !== '') return index.events.get(scope)?.has(member) === true ? [scope] : [];
  return index.names.filter((n) => index.events.get(n)?.has(member) === true && naming.events[`${n}.${member}`] === undefined);
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
  // no components.json: nothing to check the component keys against, not "all stale"; token keys check against the manifest
  if (index.names.length === 0) return unknownTokenKeys(naming.tokens);
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
  for (const key of pySorted(Object.keys(naming.events))) {
    const [scope, member] = splitKey(key);
    let owners: string[] = [];
    if (scope === '') {
      owners = index.names.filter((n) => index.events.get(n)?.has(member) === true);
      if (owners.length === 0) out.push(`events.${key}: no component has an event called ${member}`);
    } else if (!known.has(scope)) {
      out.push(`events.${key}: no canonical component is called ${scope}`);
    } else if (index.events.get(scope)?.has(member) !== true) {
      out.push(`events.${key}: ${scope} has no event called ${member}`);
    } else owners = [scope];
    const value = naming.events[key];
    if (typeof value === 'string' || value === undefined) continue;
    // The object form names what one platform emits, so that platform has to emit something nameable.
    for (const platform of EVENT_RENAME_PLATFORMS) {
      if (value[platform] === undefined) continue;
      for (const owner of owners) {
        if (!emitsName(platform, index.events.get(owner)?.get(member)?.[platform])) {
          out.push(`events.${key}.${platform}: ${owner}'s ${member} has no ${platform} mapping`);
        }
      }
    }
  }
  for (const key of pySorted(Object.keys(naming.anatomy))) {
    const [scope, member] = splitKey(key);
    if (scope === '') {
      if (![...index.anatomy.values()].some((parts) => parts.has(member))) out.push(`anatomy.${key}: no component has an anatomy part called ${member}`);
    } else if (!known.has(scope)) {
      out.push(`anatomy.${key}: no canonical component is called ${scope}`);
    } else if (index.anatomy.get(scope)?.has(member) !== true) {
      out.push(`anatomy.${key}: ${scope} has no anatomy part called ${member}`);
    }
  }
  for (const key of pySorted(Object.keys(naming.values))) out.push(...valueKeyProblems('values', key, Object.keys(naming.values[key] ?? {}), index));
  // An alias key is a canonical name too, so a pull strands it exactly as it strands a rename.
  const aliases = naming.aliases;
  for (const key of pySorted(Object.keys(aliases.components ?? {}))) {
    if (!known.has(key)) out.push(`aliases.components.${key}: no canonical component is called ${key}`);
  }
  for (const key of pySorted(Object.keys(aliases.props ?? {}))) {
    const [scope, member] = splitKey(key);
    if (scope === '') {
      if (![...index.props.values()].some((props) => props.has(member))) out.push(`aliases.props.${key}: no component has a prop called ${member}`);
    } else if (!known.has(scope)) {
      out.push(`aliases.props.${key}: no canonical component is called ${scope}`);
    } else if (index.props.get(scope)?.has(member) !== true) {
      out.push(`aliases.props.${key}: ${scope} has no prop called ${member}`);
    }
  }
  for (const key of pySorted(Object.keys(aliases.values ?? {}))) out.push(...valueKeyProblems('aliases.values', key, Object.keys(aliases.values?.[key] ?? {}), index));
  out.push(...unknownTokenKeys(naming.tokens));
  return out;
}

/** A `values`-style key and the canonical values under it, against components.json; `prefix` is the map it is in. */
function valueKeyProblems(prefix: string, key: string, values: string[], index: CanonicalIndex): string[] {
  const out: string[] = [];
  const [scope, member] = splitKey(key);
  const listed = pySorted(values);
  if (scope === '') {
    const owners = index.names.filter((n) => index.enums.get(n)?.has(member) === true);
    if (owners.length === 0) return [`${prefix}.${key}: no component has an enum prop called ${member}`];
    for (const value of listed) {
      if (!owners.some((n) => index.enums.get(n)?.get(member)?.includes(value) === true)) out.push(`${prefix}.${key}.${value}: no enum prop called ${member} has a value ${value}`);
    }
  } else if (!index.names.includes(scope)) {
    out.push(`${prefix}.${key}: no canonical component is called ${scope}`);
  } else if (index.props.get(scope)?.has(member) !== true) {
    out.push(`${prefix}.${key}: ${scope} has no prop called ${member}`);
  } else if (index.enums.get(scope)?.has(member) !== true) {
    out.push(`${prefix}.${key}: ${key} is not an enum prop`);
  } else {
    const own = index.enums.get(scope)?.get(member) ?? [];
    for (const value of listed) if (!own.includes(value)) out.push(`${prefix}.${key}.${value}: ${key} has no value ${value}`);
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
      source: null, naming: namingDefaults(), components: {}, props: {}, events: {}, anatomy: {}, values: {}, enums: {},
      cssPrefix: CANONICAL.cssPrefix, package: CANONICAL.package, typePrefix: {}, canonical: [], aliases: {}, tokens: { rename: {} },
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
  assertTokensDistinct(naming, index, file);
  assertNoShadowing(components, index.names, file);
  const events = resolveEvents(naming, index);
  const anatomy = resolveAnatomy(naming);
  assertEventsDistinct(events, index, file);
  assertPartsDistinct(anatomy, index, file);
  const values = resolveValues(naming, index);
  assertValuesDistinct(values, index, file);
  const props = renamesOnly(naming.props);
  const aliases = resolveAliases(naming, index, { components, props, values });
  assertAliasesDistinct(aliases, { components, props, values, events, anatomy }, index, file);
  const enums: Resolution['enums'] = {};
  // Every component's, not only the renamed ones': `<Icon size="md">` in Button's file is provably Icon's size.
  if (Object.keys(values).length > 0) {
    for (const [component, props] of index.enums) {
      if (props.size > 0) enums[component] = Object.fromEntries([...props].map(([p, list]): [string, string[]] => [p, [...list]]));
    }
  }
  return {
    source: file,
    naming,
    components,
    props,
    events,
    anatomy,
    values,
    enums,
    cssPrefix: naming.namespace.cssPrefix,
    package: naming.namespace.package,
    typePrefix: { ...naming.namespace.typePrefix },
    canonical: index.names,
    aliases,
    tokens: tokenRenames(naming.tokens),
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

/**
 * What a naming doc asks for that a platform's rename will not do, or will do in a way the doc probably
 * did not mean. Warnings, not errors — the doc parses and resolves — printed beside `collisions` because
 * they belong to a naming run on one platform, not to parsing a doc (so never tools/parse.ts's `warn`).
 */
export function notices(res: Resolution, platform: string, index: CanonicalIndex = canonicalIndex()): string[] {
  const out: string[] = [];
  const naming = res.naming;
  if (res.typePrefix[platform] !== undefined && !(TYPE_PREFIX_PLATFORMS as readonly string[]).includes(platform)) {
    out.push(`namespace.typePrefix.${platform} renames nothing: only ${TYPE_PREFIX_PLATFORMS.join(' and ')} have prefixed type names`);
  }
  if (index.names.length === 0) return out; // nothing says what a platform emits, or which names are props
  if ((EVENT_RENAME_PLATFORMS as readonly string[]).includes(platform)) {
    for (const key of pySorted(Object.keys(naming.events))) {
      const value = naming.events[key];
      if (typeof value !== 'string') continue;
      const [scope, member] = splitKey(key);
      for (const owner of eventOwners(naming, index, scope, member)) {
        const emitted = index.events.get(owner)?.get(member)?.[platform];
        if (emitted === undefined || emitted === conventionalEmitted(member, platform)) continue;
        const advice = emitsName(platform, emitted) ? `; use { ${platform}: … }` : '';
        out.push(`${owner}.${member} → ${value} does not reach ${platform}, which emits ${emitted}${advice}`);
      }
    }
  }
  for (const key of pySorted(Object.keys(naming.props))) {
    const [scope, member] = splitKey(key);
    const scopes = scope === '' ? index.names : [scope];
    const names = (byKind: Map<string, { has(name: string): boolean }>): boolean => scopes.some((s) => byKind.get(s)?.has(member) === true);
    if (names(index.props)) continue;
    if (names(index.events)) {
      out.push(`props.${key} names an event, not a prop: it renames the neutral name, not what each platform emits; move it to events`);
    } else if (names(index.anatomy)) {
      out.push(`props.${key} names an anatomy part, not a prop: it also renames every identifier spelled ${member}; move it to anatomy`);
    }
  }
  return out;
}

/** A doc that renames nothing: generate.ts skips the step entirely, so the output cannot move. */
export function isNoop(res: Resolution): boolean {
  return (
    Object.keys(res.components).length === 0 &&
    Object.keys(res.props).length === 0 &&
    Object.keys(res.events).length === 0 &&
    Object.keys(res.anatomy).length === 0 &&
    Object.keys(res.values).length === 0 &&
    // a doc that only adds aliases still runs the step: the compatibility layer is its whole output
    Object.keys(res.aliases).length === 0 &&
    !renamesTokens(res.tokens) &&
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

/**
 * A `tokens` block whose emitted names would be ambiguous: a brand path that is another token's canonical path, two
 * tokens emitting one CSS variable or one JS key, a Swift name `Theme` already has, or a token variable inside a
 * component's hooks when the two prefixes agree. tools/lib/token_naming.ts owns the checks, and the token build
 * runs the same ones; the stranded keys went through `assertKnownKeys` already.
 */
function assertTokensDistinct(naming: NamingDef, index: CanonicalIndex, file: string): void {
  const problems = tokenProblems(naming, index.names);
  if (problems.length === 0) return;
  throw new NamingError(`✖ ${rel(file)}: ${problems.length} token name problem(s):\n${problems.map((p) => `    ${p}`).join('\n')}`);
}

/**
 * `events`, resolved to what each platform emits. A string reaches a platform only where the canonical
 * emitted name follows the convention (`conventionalEmitted`) — Button's web `onClick` does not, so
 * `Button.onPress: onActivate` leaves web alone and `notices` says so. The object form reaches exactly
 * the platforms it lists. With no components.json nothing says what a platform emits, so the key's own
 * name under the convention is all there is, under the key's own scope.
 */
function resolveEvents(naming: NamingDef, index: CanonicalIndex): Resolution['events'] {
  const out: Resolution['events'] = {};
  const put = (platform: string, scope: string, from: string, to: string): void => {
    if (from === to) return;
    const scopes = (out[platform] ??= {});
    (scopes[scope] ??= {})[from] = to;
  };
  for (const [key, value] of Object.entries(naming.events)) {
    const [scope, member] = splitKey(key);
    for (const platform of EVENT_RENAME_PLATFORMS) {
      if (index.names.length === 0) {
        const to = typeof value === 'string' ? conventionalEmitted(value, platform) : value[platform];
        if (to !== undefined) put(platform, scope, conventionalEmitted(member, platform), to);
        continue;
      }
      for (const owner of eventOwners(naming, index, scope, member)) {
        const emitted = index.events.get(owner)?.get(member)?.[platform];
        if (!emitsName(platform, emitted)) continue;
        const to = typeof value !== 'string'
          ? value[platform]
          : emitted === conventionalEmitted(member, platform) ? conventionalEmitted(value, platform) : undefined;
        if (to !== undefined) put(platform, owner, emitted, to);
      }
    }
  }
  return out;
}

function resolveAnatomy(naming: NamingDef): Resolution['anatomy'] {
  const out: Resolution['anatomy'] = {};
  for (const [key, brand] of Object.entries(naming.anatomy)) {
    const [scope, part] = splitKey(key);
    if (part !== brand) (out[scope] ??= {})[part] = brand;
  }
  return out;
}

/**
 * The event collisions schema/naming.ts cannot see, because they depend on what each platform emits: two
 * events of one component landing on one emitted name, or a brand name that is already another of the
 * component's emitted names on that platform. Either makes the rename non-invertible.
 */
function assertEventsDistinct(events: Resolution['events'], index: CanonicalIndex, file: string): void {
  for (const [platform, scopes] of Object.entries(events)) {
    for (const [scope, renames] of Object.entries(scopes)) {
      const neutralOf = new Map<string, string>();
      for (const [neutral, platforms] of index.events.get(scope) ?? new Map<string, Record<string, string>>()) {
        const emitted = platforms[platform];
        if (emitsName(platform, emitted)) neutralOf.set(emitted, neutral);
      }
      const label = (name: string): string => (scope === '' ? name : `${scope}.${name}`);
      const seen = new Map<string, string>();
      for (const [from, to] of Object.entries(renames)) {
        const name = neutralOf.get(from) ?? from;
        const first = seen.get(to);
        if (first !== undefined) throw new NamingError(`✖ ${rel(file)}: ${label(name)} and ${label(first)} both rename to ${to} on ${platform}`);
        seen.set(to, name);
        const other = neutralOf.get(to);
        if (other !== undefined && renames[to] === undefined) {
          throw new NamingError(
            `✖ ${rel(file)}: ${label(name)} renames to ${to} on ${platform}, which ${scope} already emits for ${other} — rename ${other} too, or pick another name`,
          );
        }
      }
    }
  }
}

/** The same for anatomy: a part renamed onto another part of its component that keeps its name, or two
 *  parts (a dotted key and a bare one) renamed onto one. */
function assertPartsDistinct(anatomy: Resolution['anatomy'], index: CanonicalIndex, file: string): void {
  for (const [component, parts] of index.anatomy) {
    const renames = new Map<string, string>();
    for (const part of parts) {
      const to = anatomy[component]?.[part] ?? anatomy['']?.[part];
      if (to !== undefined) renames.set(part, to);
    }
    const seen = new Map<string, string>();
    for (const [part, to] of renames) {
      const first = seen.get(to);
      if (first !== undefined) throw new NamingError(`✖ ${rel(file)}: ${component}.${part} and ${component}.${first} both rename to ${to}`);
      seen.set(to, part);
      if (parts.has(to) && !renames.has(to)) {
        throw new NamingError(`✖ ${rel(file)}: ${component}.${part} renames to ${to}, which is already a ${component} anatomy part — rename ${to} too, or pick another name`);
      }
    }
  }
}

/**
 * `values`, per component, per prop, per value. A bare key reaches every component whose enum prop of that name
 * has the value; a dotted key's entry wins over the bare key's for the same value and merges with it otherwise.
 * With no components.json nothing says which component has which prop, so each key keeps its own scope and the
 * rewriter does the same per-value fallback when it looks a value up.
 */
function resolveValues(naming: NamingDef, index: CanonicalIndex): Resolution['values'] {
  const out: Resolution['values'] = {};
  const put = (scope: string, prop: string, value: string, brand: string): void => {
    if (value === brand) return;
    const props = (out[scope] ??= {});
    (props[prop] ??= {})[value] = brand;
  };
  for (const [key, renames] of Object.entries(naming.values)) {
    const [scope, prop] = splitKey(key);
    if (index.names.length === 0) {
      for (const [value, brand] of Object.entries(renames)) put(scope, prop, value, brand);
      continue;
    }
    const owners = scope === '' ? index.names : [scope];
    for (const owner of owners) {
      const own = index.enums.get(owner)?.get(prop);
      if (own === undefined) continue;
      const dotted = scope === '' ? naming.values[`${owner}.${prop}`] : undefined;
      for (const [value, brand] of Object.entries(renames)) {
        if (own.includes(value) && (dotted === undefined || !Object.hasOwn(dotted, value))) put(owner, prop, value, brand);
      }
    }
  }
  return out;
}

/** The value collisions schema/naming.ts cannot see: a bare and a dotted key landing two values of one prop on
 *  one brand value, or a brand value that is another of the prop's canonical values, which only components.json
 *  lists in full. Either makes the rename non-invertible. */
function assertValuesDistinct(values: Resolution['values'], index: CanonicalIndex, file: string): void {
  for (const [scope, props] of Object.entries(values)) {
    for (const [prop, renames] of Object.entries(props)) {
      const label = scope === '' ? prop : `${scope}.${prop}`;
      const own = index.enums.get(scope)?.get(prop) ?? Object.keys(renames);
      const seen = new Map<string, string>();
      for (const [value, brand] of Object.entries(renames)) {
        const first = seen.get(brand);
        if (first !== undefined) throw new NamingError(`✖ ${rel(file)}: ${label}.${value} and ${label}.${first} both rename to ${brand}`);
        seen.set(brand, value);
        if (own.includes(brand)) throw new NamingError(`✖ ${rel(file)}: ${label}.${value} renames to ${brand}, which is already one of its values`);
      }
    }
  }
}

/** A prop's name after the rename, on one component: the dotted key wins over the bare one. */
function currentProp(res: Pick<Resolution, 'props'>, component: string, prop: string): string {
  return res.props[`${component}.${prop}`] ?? res.props[prop] ?? prop;
}

/** An enum value's name after the rename, on one component's prop. */
function currentValue(res: Pick<Resolution, 'values'>, component: string, prop: string, value: string): string {
  return res.values[component]?.[prop]?.[value] ?? res.values['']?.[prop]?.[value] ?? value;
}

/**
 * `aliases`, resolved per component to the names the compatibility layer writes. A bare key reaches every component
 * whose prop (or enum value) it names and merges with a dotted key's entries, as `values` does; without
 * components.json only a dotted key has a component to land on.
 */
function resolveAliases(naming: NamingDef, index: CanonicalIndex, res: Pick<Resolution, 'components' | 'props' | 'values'>): Resolution['aliases'] {
  const out: Resolution['aliases'] = {};
  const at = (component: string): CompatAliases => (out[component] ??= { current: res.components[component] ?? component, components: [], props: [], values: [] });
  const owners = (scope: string, has: (component: string) => boolean): string[] => (scope !== '' ? [scope] : index.names.filter(has));
  const uses = (label: string, list: AliasEntry[]): AliasUse[] => list.map((entry, i) => ({ label: `${label}[${i}]`, entry }));
  const { components = {}, props = {}, values = {} } = naming.aliases;
  for (const [component, list] of Object.entries(components)) at(component).components.push(...uses(`aliases.components.${component}`, list));
  for (const [key, list] of Object.entries(props)) {
    const [scope, prop] = splitKey(key);
    for (const component of owners(scope, (c) => index.props.get(c)?.has(prop) === true)) {
      const bucket = at(component).props;
      let item = bucket.find((p) => p.prop === prop);
      if (item === undefined) bucket.push((item = { prop, current: currentProp(res, component, prop), aliases: [] }));
      item.aliases.push(...uses(`aliases.props.${key}`, list));
    }
  }
  for (const [key, byValue] of Object.entries(values)) {
    const [scope, prop] = splitKey(key);
    for (const [value, list] of Object.entries(byValue)) {
      for (const component of owners(scope, (c) => index.enums.get(c)?.get(prop)?.includes(value) === true)) {
        const bucket = at(component).values;
        let item = bucket.find((v) => v.prop === prop && v.value === value);
        if (item === undefined) bucket.push((item = { prop, currentProp: currentProp(res, component, prop), value, current: currentValue(res, component, prop, value), aliases: [] }));
        item.aliases.push(...uses(`aliases.values.${key}.${value}`, list));
      }
    }
  }
  return out;
}

/**
 * The alias collisions schema/naming.ts cannot see, because they need components.json or the resolved renames: an
 * old name the compatibility layer would export beside a name the component (or the system) already has. Each one
 * would shadow a real name in the wrapper or the barrel, so the run stops with the entry named.
 */
function assertAliasesDistinct(
  aliases: Resolution['aliases'],
  res: Pick<Resolution, 'components' | 'props' | 'values' | 'events' | 'anatomy'>,
  index: CanonicalIndex,
  file: string,
): void {
  const fail = (use: AliasUse, why: string): never => {
    throw new NamingError(`✖ ${rel(file)}: ${use.label} (${use.entry.name}) ${why}`);
  };
  const componentNames = new Set([...index.names, ...Object.keys(res.components), ...Object.values(res.components)]);
  for (const component of pySorted(Object.keys(aliases))) {
    const a = aliases[component] as CompatAliases;
    for (const use of a.components) {
      if (componentNames.has(use.entry.name)) fail(use, 'is already a component name, canonical or brand — pick another alias');
    }

    // A prop alias becomes a prop of the wrapper, beside every name the component already takes on any platform.
    const taken = new Map<string, string>();
    for (const name of index.members.get(component) ?? []) taken.set(name, `a prop, event or anatomy part of ${component}`);
    for (const prop of index.props.get(component) ?? []) {
      const current = currentProp(res, component, prop);
      if (current !== prop) taken.set(current, `the brand name of ${component}.${prop}`);
    }
    for (const scopes of Object.values(res.events)) {
      for (const [from, to] of Object.entries(scopes[component] ?? {})) taken.set(to, `the brand name of ${component}'s ${from} event`);
    }
    for (const [part, to] of Object.entries({ ...res.anatomy[''], ...res.anatomy[component] })) {
      if (index.anatomy.get(component)?.has(part) ?? true) taken.set(to, `the brand name of ${component}'s ${part} part`);
    }
    for (const name of [...RESERVED_WEB, ...RESERVED_RN]) if (!taken.has(name)) taken.set(name, 'a reserved prop name (RESERVED_WEB, RESERVED_RN)');
    const seenProp = new Map<string, string>();
    for (const item of a.props) {
      for (const use of item.aliases) {
        const why = taken.get(use.entry.name);
        if (why !== undefined) fail(use, `is already ${why} — pick another alias`);
        const first = seenProp.get(use.entry.name);
        if (first !== undefined && first !== use.label) fail(use, `and ${first} both alias a prop of ${component} as ${use.entry.name}`);
        seenProp.set(use.entry.name, use.label);
      }
    }

    const seenValue = new Map<string, string>();
    for (const item of a.values) {
      const own = index.enums.get(component)?.get(item.prop) ?? [];
      const values = new Set([...own, ...own.map((v) => currentValue(res, component, item.prop, v))]);
      for (const use of item.aliases) {
        if (values.has(use.entry.name)) fail(use, `is already a value of ${component}.${item.prop}, canonical or brand — pick another alias`);
        const key = `${item.prop}:${use.entry.name}`;
        const first = seenValue.get(key);
        if (first !== undefined && first !== use.label) fail(use, `and ${first} both alias a value of ${component}.${item.prop} as ${use.entry.name}`);
        seenValue.set(key, use.label);
      }
    }
  }
}

/** Why a platform's compatibility layer cannot carry an alias kind: the support matrix's empty cells. */
const UNSUPPORTED: Record<string, string> = {
  'props:lit': 'the compatibility layer cannot add an attribute to a generated element without editing it',
  'props:swiftui': "the compatibility layer cannot add an argument to a generated view's initializer without editing it",
  'values:lit': "the compatibility layer cannot map an attribute's old value on a generated element without editing it",
  'values:swiftui': 'the compatibility layer cannot add a case to a generated enum without editing it',
};

const ALIAS_KIND: Record<keyof typeof ALIAS_SUPPORT, string> = { components: 'component', props: 'prop', values: 'value' };

function appliesTo(entry: AliasEntry, platform: string): boolean {
  return entry.platforms === undefined || (entry.platforms as readonly string[]).includes(platform);
}

/** An entry that reaches a platform whose compatibility layer cannot carry its kind stops that platform's rename, and
 *  says which `platforms` list would make it true. */
export function assertAliasesSupported(res: Resolution, platform: string): void {
  for (const component of pySorted(Object.keys(res.aliases))) {
    const a = res.aliases[component] as CompatAliases;
    const byKind: [keyof typeof ALIAS_SUPPORT, AliasUse[]][] = [
      ['components', a.components],
      ['props', a.props.flatMap((p) => p.aliases)],
      ['values', a.values.flatMap((v) => v.aliases)],
    ];
    for (const [kind, uses] of byKind) {
      if (ALIAS_SUPPORT[kind].includes(platform)) continue;
      const use = uses.find((u) => appliesTo(u.entry, platform));
      if (use === undefined) continue;
      const why = UNSUPPORTED[`${kind}:${platform}`] ?? `${platform} has no compatibility layer`;
      throw new NamingError(
        `✖ ${res.source === null ? 'naming' : rel(res.source)}: ${use.label} (${use.entry.name}): ${ALIAS_KIND[kind]} aliases are not supported on ${platform} — ${why}. ` +
          `Add platforms: [${ALIAS_SUPPORT[kind].join(', ')}] to the entry.`,
      );
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
  /** This platform's event renames: scope → source emitted name → target. Identifiers on web and React
   *  Native, CustomEvent names on Lit, nothing anywhere else. */
  events: Map<string, Map<string, string>>;
  /** Scope → source anatomy part → target part, camelCase. */
  anatomy: Map<string, Map<string, string>>;
  /** Scope → canonical enum prop → source value → target value. Keyed by the canonical prop name in both
   *  directions: a value context reads the prop's source spelling and maps it back through `props` first. */
  values: Map<string, Map<string, Map<string, string>>>;
  /** Component → canonical enum prop → its full value set, source side: what an object literal's keys, a class
   *  modifier or a SwiftUI enum's cases are compared against. Empty without components.json. */
  valueSets: Map<string, Map<string, string[]>>;
  /** Source-side component name → canonical name, for the prop scope of a file or an element. */
  canonicalOf: Map<string, string>;
  /** The same for every system component, renamed or not: the scope an event attribute on an element is in. */
  systemTags: Map<string, string>;
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
  /** Token CSS variable → its spelling in the other direction, for each token whose emitted name moves under `tokens`. */
  tokenCss: Map<string, string>;
  /** Token camel key → the same, on TOKEN_KEY_PLATFORMS; empty everywhere else. */
  tokenKeys: Map<string, string>;
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

  const scoped = (maps: Record<string, Record<string, string>>): Map<string, Map<string, string>> =>
    new Map(
      Object.entries(maps).map(([scope, renames]): [string, Map<string, string>] => [
        scope,
        new Map(Object.entries(renames).map(([c, b]): [string, string] => (forward ? [c, b] : [b, c]))),
      ]),
    );

  const values = new Map<string, Map<string, Map<string, string>>>();
  for (const [scope, byProp] of Object.entries(res.values)) values.set(scope, scoped(byProp));
  const valueSets = new Map<string, Map<string, string[]>>();
  for (const [component, byProp] of Object.entries(res.enums)) {
    valueSets.set(
      component,
      new Map(
        Object.entries(byProp).map(([prop, list]): [string, string[]] => {
          const renames: Record<string, string> = { ...res.values['']?.[prop], ...res.values[component]?.[prop] };
          return [prop, forward ? [...list] : list.map((value) => renames[value] ?? value)];
        }),
      ),
    );
  }

  const canonicalOf = new Map<string, string>();
  for (const [canonical, brand] of Object.entries(res.components)) canonicalOf.set(forward ? canonical : brand, canonical);
  const systemTags = new Map(canonicalOf);
  for (const [name] of identities) if (res.components[name] === undefined) systemTags.set(name, name);

  // Every manifest token's canonical and emitted names, keyed by the source side; the checks made both sides injective.
  const tokenCss = new Map<string, string>();
  const tokenKeys = new Map<string, string>();
  if (renamesTokens(res.tokens)) {
    const keys = (TOKEN_KEY_PLATFORMS as readonly string[]).includes(platform);
    for (const name of TOKEN_NAMES) {
      const pairs: [Map<string, string>, string, string][] = [[tokenCss, cssName(name), emittedCssName(name, res.tokens)]];
      if (keys) pairs.push([tokenKeys, camelName(name), emittedCamelName(name, res.tokens)]);
      for (const [map, canonical, emitted] of pairs) {
        if (canonical !== emitted) map.set(forward ? canonical : emitted, forward ? emitted : canonical);
      }
    }
  }

  const byLength = (a: [string, string], b: [string, string]): number => b[0].length - a[0].length;
  return {
    tokenCss,
    tokenKeys,
    direction,
    platform,
    stems: [...components, ...identities].sort(byLength),
    typeStems: types.filter(([from]) => /^[A-Z]/.test(from)).sort(byLength),
    camelStems: types.filter(([from]) => /^[a-z]/.test(from)).sort(byLength),
    props,
    events: scoped(res.events[platform] ?? {}),
    anatomy: scoped(res.anatomy),
    values,
    valueSets,
    canonicalOf,
    systemTags,
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
    const scope = /^[A-Z]/.test(tag) ? v.canonicalOf.get(tag) : canonicalOfTag(tag, v.canonicalOf, v);
    if (scope !== undefined) out.push({ start: (m.index as number) + 1 + tag.length, end: (m.index as number) + m[0].length, scope });
  }
  return out;
}

/** One opening tag an event attribute can sit on. `component` is the system component the element renders,
 *  renamed or not; an element that is none — an intrinsic `<button>`, an imported `<Pressable>` — has
 *  `null`, and its `onClick` or `onPress` is its own. */
export type ElementScope = { start: number; end: number; tag: string; component: string | null };

/**
 * Every opening tag in a file, for the event scope of an attribute. Unlike `tagScopes` it counts braces,
 * because React Native's Alert writes `<Button leadingIcon={<Icon … />} onPress={onDismiss}>`, which the
 * first `>` would end before `onPress`; the nested `<Icon …>` is an entry of its own, and the innermost
 * element holding a position wins. Sorted by `start`.
 */
export function elementScopes(text: string, v: Vocab): ElementScope[] {
  const out: ElementScope[] = [];
  for (const m of text.matchAll(/<([A-Za-z][A-Za-z0-9._-]*)/g)) {
    const tag = m[1] as string;
    const start = (m.index as number) + m[0].length;
    const end = openingTagEnd(text, start);
    if (end === -1) continue;
    const component = (/^[A-Z]/.test(tag) ? v.systemTags.get(tag) : canonicalOfTag(tag, v.systemTags, v)) ?? null;
    out.push({ start, end, tag, component });
  }
  return out;
}

/** Just past the `>` that closes an opening tag whose attributes start at `from`, skipping braced values
 *  and quoted strings; -1 when it runs into a blank line first, which no opening tag does. */
function openingTagEnd(text: string, from: number): number {
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    const c = text.charAt(i);
    if (c === '"' || c === "'") {
      const close = text.indexOf(c, i + 1);
      const eol = text.indexOf('\n', i + 1);
      if (close !== -1 && (eol === -1 || close < eol)) i = close; // a string on one line; otherwise a stray apostrophe
    } else if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (c === '>' && depth <= 0) return i + 1;
    else if (c === '\n' && text.charAt(i + 1) === '\n') return -1;
  }
  return -1;
}

/** `acme-cta-button` → `Button`: the custom-element spelling of a component in `names`. */
function canonicalOfTag(tag: string, names: Map<string, string>, v: Vocab): string | undefined {
  if (!tag.startsWith(`${v.cssFrom}-`)) return undefined;
  const stem = tag.slice(v.cssFrom.length + 1);
  for (const [name, canonical] of names) {
    if (kebab(name) === stem) return canonical;
  }
  return undefined;
}

/** An identifier in attribute position inside an opening tag: `<Button onClick={…}>`, not `{onClick}`. */
function isAttributeName(text: string, index: number, length: number): boolean {
  return /\s/.test(text.charAt(index - 1)) && /^\s*=(?![=>])/.test(text.slice(index + length, index + length + 16));
}

function camelOf(kebabName: string): string {
  return kebabName.replace(/-([a-z0-9])/g, (_m, c: string) => c.toUpperCase());
}

/**
 * One generated file's text, renamed. The scan is a single ordered alternation walked once, so every
 * position is rewritten at most once and a gate hook wins over any rule that would match inside it.
 * `ambiguous`, when given, collects `<line>: <text>` for each enum value the rename could not tie to one prop.
 */
export function rewrite(text: string, v: Vocab, file: string, ambiguous?: string[]): string {
  const kind = fileKind(file);
  const { bindings: protectedIdents, ranges: protectedRanges } = externalImports(text, kind, v);
  const valuesOn = v.values.size > 0;
  const scopes = v.props.size > 0 || valuesOn ? tagScopes(text, v) : [];
  const elements = v.events.size > 0 || valuesOn ? elementScopes(text, v) : [];
  const eventSources = new Set([...v.events.values()].flatMap((renames) => [...renames.keys()]));
  const stem = fileStem(file);
  const ownScope = v.canonicalOf.get(stem) ?? stem;

  // The spellings only an event or anatomy rename reaches, tried before every other rule and only when
  // there is such a rename. When one matches but renames nothing, the scan falls back to the rules below
  // at the same position, so the rest of the file comes out exactly as it did without them.
  const extra = [
    ...(v.platform === 'lit' && v.events.size > 0
      ? [
          // Lit's emitted name: dispatched, listened for in the component's own files, bound on its element
          String.raw`(?<=\bnew\s+CustomEvent(?:<[^()\n]*>)?\(\s*)${QUOTED}`,
          String.raw`(?<=\b(?:add|remove)EventListener\(\s*)${QUOTED}`,
          String.raw`@[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?=\s*=)`,
        ]
      : []),
    // a stylesheet selecting a slot by name is the slot's own spelling too
    ...(v.anatomy.size > 0 ? [String.raw`\bslot\[name=(?:"[a-z][a-z0-9-]*"|'[a-z][a-z0-9-]*')\]`] : []),
  ];
  const head = [
    GATE_HOOK.source,
    // `::part(label)` pairs with the `part="label"` hook above, so it stays canonical too
    String.raw`::part\([^)\n]*\)`,
  ];
  // An emitted token name, only under a `tokens` block. Exact membership, so a dotted ref or any other name is left
  // to the rules below, and ahead of the namespace rule, which would otherwise claim a token variable that shares its prefix.
  const cssTokens = v.tokenCss.size > 0 && (kind === 'css' || kind === 'ts');
  const keyTokens = v.tokenKeys.size > 0 && (kind === 'ts' || kind === 'swift');
  const keyNames = keyTokens ? alternation([...v.tokenKeys.keys()]) : '';
  const rest = [
    ...(cssTokens ? [`${BEFORE}--(?:${alternation([...v.tokenCss.keys()].map((n) => n.slice(2)))})${AFTER}`] : []),
    ...(keyTokens ? [String.raw`(?<=\.)(?:${keyNames})${AFTER}`, `'(?:${keyNames})'|"(?:${keyNames})"`] : []),
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
  ];
  const base = new RegExp([...head, ...rest].join('|'), 'g');
  // An enum value's contexts sit after the gate hooks and before everything else, and only when the doc renames a
  // value. One that matches but renames nothing falls back to `base` at the same position, like `extra` does.
  const tail = valuesOn ? new RegExp([...head, `(?<value>${valueAlternatives(kind).join('|')})`, ...rest].join('|'), 'g') : base;
  const scan = extra.length === 0 ? tail : new RegExp([`(?<extra>${extra.join('|')})`, tail.source].join('|'), 'g');

  const scopeAt = (index: number): string => {
    for (const s of scopes) if (index >= s.start && index < s.end) return s.scope;
    return ownScope;
  };
  const elementAt = (index: number): ElementScope | undefined => {
    let found: ElementScope | undefined;
    for (const e of elements) {
      if (e.start > index) break;
      if (index < e.end) found = e;
    }
    return found;
  };
  const propAt = (id: string, index: number): string | null => {
    const scope = scopeAt(index);
    return v.props.get(scope)?.get(id) ?? v.props.get('')?.get(id) ?? null;
  };
  const kebabPropAt = (name: string, index: number): string | null => {
    const renamed = propAt(camelOf(name), index);
    return renamed === null ? null : kebab(renamed);
  };
  const partAt = (name: string, index: number): string | null => {
    const scope = scopeAt(index);
    const camel = camelOf(name);
    const renamed = v.anatomy.get(scope)?.get(camel) ?? v.anatomy.get('')?.get(camel);
    return renamed === undefined ? null : kebab(renamed);
  };
  /** A part's own spelling: the anatomy map first, then a `props` key, which reached parts before `anatomy` existed. */
  const kebabPartAt = (name: string, index: number): string | null => partAt(name, index) ?? kebabPropAt(name, index);
  const eventIn = (scope: string, name: string): string | null => v.events.get(scope)?.get(name) ?? v.events.get('')?.get(name) ?? null;
  /** A web or React Native emitted name: on a system component's element it is that component's, and on
   *  any other element (`<button onClick>`, `<Pressable onPress>`) it is that element's own and stays;
   *  everywhere else — a value, the props interface, a call — it is the file's own component's. */
  const eventAt = (id: string, index: number): string | null => {
    if (v.platform === 'lit' || !eventSources.has(id)) return null;
    const tag = elementAt(index);
    if (tag !== undefined && isAttributeName(text, index, id.length)) {
      return tag.component === null || protectedIdents.has(tag.tag) ? null : eventIn(tag.component, id);
    }
    return eventIn(ownScope, id);
  };
  const extraReplacement = (match: string, index: number): string | null => {
    if (match.startsWith('@')) {
      const component = elementAt(index)?.component ?? null;
      const renamed = component === null ? null : eventIn(component, match.slice(1));
      return renamed === null ? null : `@${renamed}`;
    }
    if (match.startsWith('slot[')) {
      const renamed = partAt(match.slice(match.indexOf('=') + 2, -2), index);
      return renamed === null ? null : replaceQuoted(match, () => renamed);
    }
    const renamed = eventIn(ownScope, match.slice(1, -1));
    return renamed === null ? null : `${match.charAt(0)}${renamed}${match.charAt(0)}`;
  };

  const external = (index: number): boolean => protectedRanges.some((r) => index >= r.start && index < r.end);
  const values = valuesOn
    ? enumValueRules(text, kind, v, { ownScope, scopeAt, elementAt, elements, isProtected: (name) => protectedIdents.has(name) })
    : null;
  /** The token rules' matches: a `--` name, a quoted key, or a key right after a `.`, each renamed only if it is a token. */
  const emittedToken = (match: string, index: number): string | null => {
    if (cssTokens && match.startsWith('--')) return v.tokenCss.get(match) ?? null;
    if (!keyTokens) return null;
    const quote = match.charAt(0);
    if (quote === "'" || quote === '"') {
      const to = v.tokenKeys.get(match.slice(1, -1));
      return to === undefined ? null : `${quote}${to}${quote}`;
    }
    return text.charAt(index - 1) === '.' ? (v.tokenKeys.get(match) ?? null) : null;
  };
  const token = (match: string, index: number): string =>
    external(index)
      ? match
      : (emittedToken(match, index) ?? replacement(match, index, v, kind, protectedIdents, propAt, kebabPropAt, kebabPartAt, eventAt, values?.modifierAt));
  /** What the rules below the value contexts make of `text[start, end)`: the parts of a value context that are
   *  not its values — the prop's name, a type name — come out exactly as they would have without it. */
  const baseSpan = (start: number, end: number): string => {
    let s = '';
    let from = start;
    base.lastIndex = start;
    for (let b = base.exec(text); b !== null && b.index + b[0].length <= end; b = base.exec(text)) {
      s += text.slice(from, b.index) + token(b[0], b.index);
      from = b.index + b[0].length;
      base.lastIndex = from;
    }
    return s + text.slice(from, end);
  };

  let out = '';
  let at = 0;
  /** An object key or a SwiftUI case `enumValueRules` decided up front, emitted in place of whatever matched there. */
  const positional = (index: number): boolean => {
    const decided = values?.positional.get(index);
    if (decided === undefined) return false;
    out += text.slice(at, index) + decided.to;
    at = index + decided.length;
    scan.lastIndex = at;
    return true;
  };
  for (let m = scan.exec(text); m !== null; m = scan.exec(text)) {
    if (positional(m.index)) continue;
    let match = m[0];
    let index = m.index;
    let groups = m.groups;
    let renamed = groups?.extra === undefined || external(index) ? null : extraReplacement(match, index);
    if (renamed === null && groups?.extra !== undefined) {
      tail.lastIndex = index;
      const b = tail.exec(text);
      if (b === null) {
        scan.lastIndex = index + match.length;
        continue;
      }
      if (positional(b.index)) continue;
      match = b[0];
      index = b.index;
      groups = b.groups;
    }
    if (renamed === null && groups?.value !== undefined && values !== null) {
      renamed = external(index) ? null : values.replace(match, index, baseSpan);
      if (renamed === null) {
        base.lastIndex = index;
        const b = base.exec(text);
        if (b === null || b.index !== index) {
          // Nothing else starts here: step past the position rather than the match, so what is inside it is still seen.
          scan.lastIndex = index + 1;
          continue;
        }
        match = b[0];
      }
    }
    renamed ??= token(match, index);
    out += text.slice(at, index) + renamed;
    at = index + match.length;
    scan.lastIndex = at;
  }
  if (values !== null && ambiguous !== undefined) ambiguous.push(...values.hits());
  return out + text.slice(at);
}

// ---------------------------------------------------------------- enum values

type Range = { start: number; end: number };

const VALUE = '[A-Za-z0-9][A-Za-z0-9-]*';
const QUOTED_VALUE = `(?:'${VALUE}'|"${VALUE}")`;
const PROP_ID = '[a-z][A-Za-z0-9]*';
const PROP_NAME = '[a-z][A-Za-z0-9]*(?:-[a-z0-9]+)*';
const VALUE_UNION = String.raw`(?:\|\s*)?${QUOTED_VALUE}(?:\s*\|\s*${QUOTED_VALUE})*`;
const TYPE_REF = '[A-Za-z_$][A-Za-z0-9_$.]*';

/**
 * The contexts that tie an enum value to one prop, as scan alternatives, most specific first. Each is matched
 * whole and decided by `enumValueRules`. The last ones only ever report: a SwiftUI implicit member (`.primary` is
 * also a `ShapeStyle`), a prop interpolated into a name, and any other quoted literal.
 */
function valueAlternatives(kind: FileKind): string[] {
  const out = [String.raw`\[${PROP_NAME}\s*=\s*${QUOTED_VALUE}\s*\]`]; // [variant='primary'], :host([variant="primary"])
  if (kind === 'ts') {
    out.push(
      String.raw`${BEFORE}type\s+[A-Z][A-Za-z0-9]*\s*=\s*${VALUE_UNION}`, // type ButtonVariant = 'primary' | …
      String.raw`\bcase\s+${QUOTED_VALUE}(?=\s*:)`, // case 'primary': inside switch (variant)
      String.raw`${BEFORE}${PROP_ID}\s*[!=]==?\s*${QUOTED_VALUE}`, // variant === 'primary'
      String.raw`${BEFORE}${PROP_NAME}=\{\s*${QUOTED_VALUE}\s*\}`, // variant={'primary'}
      String.raw`${BEFORE}${PROP_ID}\s*:\s*${TYPE_REF}(?:\s*\|\s*${TYPE_REF})*\s*=(?![=>])\s*${QUOTED_VALUE}`, // accessor variant: ButtonVariant = 'primary'
      String.raw`(?:${BEFORE}${PROP_ID}|"${PROP_ID}"|'${PROP_ID}')\??\s*:\s*${VALUE_UNION}`, // variant: 'primary', "variant": "primary", size?: 'sm' | 'md'
      String.raw`${BEFORE}${PROP_NAME}\s*=(?![=>])\s*${QUOTED_VALUE}`, // variant="primary", variant = 'primary'
      String.raw`\$\{\s*(?:(?:this|props)\s*\.\s*)?${PROP_ID}\s*\}`, // ${variant} inside a template
    );
  }
  if (kind === 'swift') {
    out.push(
      String.raw`\bcase\s+\.${PROP_ID}(?:\s*,\s*\.${PROP_ID})*(?=\s*:)`, // case .primary: inside switch variant
      String.raw`(?<![A-Za-z0-9_$)\]])\.${PROP_ID}${AFTER}`, // .primary anywhere else
    );
  }
  out.push(QUOTED_VALUE);
  return out;
}

type ValueRules = {
  /** Start → what replaces it: object keys and SwiftUI enum cases, decided for the whole literal at once. */
  positional: Map<number, { length: number; to: string }>;
  /** A value context matched at `index`, renamed, or null when it renames nothing. */
  replace: (match: string, index: number, span: (start: number, end: number) => string) => string | null;
  /** The value in a `ds-button--primary` modifier, for `renameCssName`. */
  modifierAt: (stem: string, value: string, index: number) => string | null;
  /** `<line>: <trimmed line>` for each ambiguous value, one per line, in line order. */
  hits: () => string[];
};

type ValueScope = {
  ownScope: string;
  scopeAt: (index: number) => string;
  elementAt: (index: number) => ElementScope | undefined;
  elements: ElementScope[];
  isProtected: (name: string) => boolean;
};

/**
 * How one file's enum values are renamed. A value moves only where the code ties it to one prop — an attribute on
 * the component's element, a selector, an object property, a default, a comparison or `case`, a union, a modifier
 * class, a whole-set object literal or SwiftUI enum — and never inside a comment or a token reference. A literal
 * equal to a renamed value that no such context claims is left alone in both directions and reported, which is
 * what keeps brand → canonical → brand exact.
 */
function enumValueRules(text: string, kind: FileKind, v: Vocab, at: ValueScope): ValueRules {
  const { ownScope, scopeAt, elementAt } = at;
  const comments = commentRanges(text, kind);
  const commentEnd = new Map(comments.map((r): [number, number] => [r.start, r.end]));
  /** Literal positions a context has already decided, renamed or not, so no later alternative reports or re-decides them. */
  const settled = new Set<number>();
  const found = new Map<number, string>();

  const valueIn = (scope: string, prop: string, value: string): string | null =>
    v.values.get(scope)?.get(prop)?.get(value) ?? v.values.get('')?.get(prop)?.get(value) ?? null;
  const isEnum = (scope: string, prop: string): boolean =>
    v.valueSets.get(scope)?.has(prop) === true || v.values.get(scope)?.has(prop) === true || v.values.get('')?.has(prop) === true;
  /** The canonical prop a source-side spelling names: as written going to the brand, back through `props` otherwise. */
  const canonicalProp = (scope: string, id: string): string =>
    v.direction === 'brand' ? id : (v.props.get(scope)?.get(id) ?? v.props.get('')?.get(id) ?? id);
  /** `ButtonVariant` → Button's `variant`: the longest component name, then a Pascal remainder naming an enum prop. */
  const typeOwner = (name: string): { scope: string; prop: string } | null => {
    let best: [string, string] | undefined;
    for (const entry of v.systemTags) {
      const source = entry[0];
      if (name.length > source.length && name.startsWith(source) && /^[A-Z]/.test(name.charAt(source.length)) && (best === undefined || source.length > best[0].length)) {
        best = entry;
      }
    }
    if (best === undefined) return null;
    const prop = lower(name.slice(best[0].length));
    return isEnum(best[1], prop) ? { scope: best[1], prop } : null;
  };

  // The renamed values a file can reach: its own component's, and those of every system component it renders.
  const reach = new Set<string>();
  const propsInReach = new Set<string>();
  for (const scope of new Set(['', ownScope, ...at.elements.flatMap((e) => (e.component === null ? [] : [e.component]))])) {
    for (const [prop, renames] of v.values.get(scope) ?? []) {
      propsInReach.add(prop);
      for (const value of renames.keys()) reach.add(value);
    }
  }
  const hit = (index: number): void => {
    const start = text.lastIndexOf('\n', index - 1) + 1;
    const eol = text.indexOf('\n', index);
    const line = text.slice(0, start).split('\n').length;
    if (!found.has(line)) found.set(line, `${line}: ${text.slice(start, eol === -1 ? text.length : eol).trim()}`);
  };

  const positional: ValueRules['positional'] = new Map();
  const decide = (start: number, length: number, quoted: boolean, to: string): void => {
    const q = quoted ? text.charAt(start) : '';
    positional.set(start, { length, to: `${q}${to}${q}` });
  };

  // An object literal whose keys are exactly one enum prop's values, of the component whose scope it sits in.
  if (kind === 'ts') {
    for (let open = text.indexOf('{'); open !== -1; open = text.indexOf('{', open + 1)) {
      if (text.charAt(open - 1) === '$' || inRanges(comments, open)) continue;
      const keys = objectKeys(text, open, commentEnd);
      if (keys === null || keys.length === 0) continue;
      const scope = scopeAt(open);
      const names = new Set(keys.map((k) => k.name));
      const owners = names.size !== keys.length
        ? []
        : [...(v.valueSets.get(scope) ?? [])].filter(([, list]) => list.length === names.size && list.every((x) => names.has(x))).map(([p]) => p);
      for (const k of keys) {
        const to = owners.length === 1 ? valueIn(scope, owners[0] as string, k.name) : null;
        if (owners.length === 1) settled.add(k.start);
        if (to !== null) decide(k.start, k.name.length + (k.quoted ? 2 : 0), k.quoted, to);
        else if (owners.length !== 1 && reach.has(k.name)) hit(k.start);
      }
    }
  }

  // A SwiftUI `enum ButtonVariant` whose cases are exactly Button's variant values, and `switch self` inside it.
  const enumBodies: { start: number; end: number; scope: string; prop: string }[] = [];
  if (kind === 'swift') {
    for (const m of text.matchAll(/\benum\s+([A-Z][A-Za-z0-9]*)[^{\n]*\{/g)) {
      const owner = inRanges(comments, m.index) ? null : typeOwner(m[1] as string);
      const set = owner === null ? undefined : v.valueSets.get(owner.scope)?.get(owner.prop);
      if (owner === null || set === undefined) continue;
      const open = m.index + m[0].length - 1;
      const end = braceEnd(text, open, commentEnd);
      enumBodies.push({ start: open, end, ...owner });
      const cases = swiftCases(text, open, end);
      const names = new Set(cases.map((c) => c.name));
      const whole = names.size === cases.length && names.size === set.length && set.every((x) => names.has(x));
      for (const c of cases) {
        if (whole) settled.add(c.start);
        const to = whole ? valueIn(owner.scope, owner.prop, c.name) : null;
        if (to === null) {
          if (!whole && reach.has(c.name)) hit(c.start);
          continue;
        }
        decide(c.start, c.name.length, false, to);
        if (c.raw !== null && text.slice(c.raw, c.raw + c.name.length + 2) === `"${c.name}"`) decide(c.raw, c.name.length + 2, true, to);
      }
    }
  }

  const switches: { start: number; end: number; scope: string; id: string }[] = [];
  const switchPattern = kind === 'swift'
    ? /\bswitch\s+(?:self\s*\.\s*)?([a-z][A-Za-z0-9]*)\s*\{/g
    : kind === 'ts' ? /\bswitch\s*\(\s*(?:[A-Za-z_$][A-Za-z0-9_$]*\s*\.\s*)?([a-z][A-Za-z0-9]*)\s*\)\s*\{/g : null;
  for (const m of switchPattern === null ? [] : text.matchAll(switchPattern)) {
    if (inRanges(comments, m.index)) continue;
    const open = m.index + m[0].length - 1;
    switches.push({ start: open, end: braceEnd(text, open, commentEnd), scope: scopeAt(m.index), id: m[1] as string });
  }
  const innermost = <T extends Range>(ranges: T[], index: number): T | undefined => {
    let best: T | undefined;
    for (const r of ranges) if (index > r.start && index < r.end && (best === undefined || r.start > best.start)) best = r;
    return best;
  };
  const switchAt = (index: number): { scope: string; prop: string } | null => {
    const s = innermost(switches, index);
    if (s === undefined) return null;
    if (s.id !== 'self') return { scope: s.scope, prop: canonicalProp(s.scope, s.id) };
    const e = innermost(enumBodies, s.start);
    return e === undefined ? null : { scope: e.scope, prop: e.prop };
  };

  /** Which prop a matched context names, and where in the match its values start. */
  const planOf = (match: string, index: number): { scope: string; prop: string; from: number } | null => {
    if (match.startsWith('[')) {
      // a selector names the element before it when there is one (`ds-icon[size='sm']`), else the file's host
      const tag = /([a-z][a-z0-9]*(?:-[a-z0-9]+)+)$/.exec(text.slice(Math.max(0, index - 80), index))?.[1];
      const scope = (tag === undefined ? undefined : canonicalOfTag(tag, v.systemTags, v)) ?? scopeAt(index);
      return { scope, prop: canonicalProp(scope, camelOf(match.slice(1, match.indexOf('=')).trim())), from: match.indexOf('=') };
    }
    const alias = /^type\s+([A-Z][A-Za-z0-9]*)/.exec(match);
    if (alias !== null) {
      const owner = typeOwner(alias[1] as string);
      return owner === null ? null : { ...owner, from: match.indexOf('=') };
    }
    if (/^case\s/.test(match)) {
      const owner = switchAt(index);
      return owner === null ? null : { ...owner, from: 4 };
    }
    const named = /^(["']?)([a-z][A-Za-z0-9]*(?:-[a-z0-9]+)*)\1(\??\s*:|\s*[!=]==?|\s*=)/.exec(match);
    if (named === null) return null;
    const name = named[2] as string;
    const from = named[0].length;
    if ((named[3] as string).trim() === '=') {
      // an attribute belongs to its element's component; an intrinsic or imported element's attribute is its own
      const element = elementAt(index);
      if (element !== undefined && isAttributeName(text, index, name.length)) {
        if (element.component === null || at.isProtected(element.tag)) return null;
        return { scope: element.component, prop: canonicalProp(element.component, camelOf(name)), from };
      }
      if (/^\s*\{/.test(match.slice(from))) return null;
    }
    const scope = scopeAt(index);
    return { scope, prop: canonicalProp(scope, camelOf(name)), from };
  };

  const modifierBefore = new RegExp(String.raw`(?<![A-Za-z0-9_-])${escape(v.cssFrom)}-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?--$`);

  const replace: ValueRules['replace'] = (match, index, span) => {
    if (inRanges(comments, index)) return null;
    const first = match.charAt(0);
    if (first === '$') {
      // `color.action.${variant}.background`: a token name built from the value, which no rename may move.
      // A modifier class built the same way (`ds-button--${variant}`) is the one interpolation that follows it.
      const id = /([a-z][A-Za-z0-9]*)\s*\}$/.exec(match)?.[1] as string;
      const near = text.charAt(index - 1) + text.charAt(index + match.length);
      if (/[.-]/.test(near) && !modifierBefore.test(text.slice(Math.max(0, index - 120), index)) && propsInReach.has(canonicalProp(ownScope, id))) hit(index);
      return null;
    }
    if (first === '.') {
      if (!settled.has(index + 1) && reach.has(match.slice(1))) hit(index);
      return null;
    }
    if (new RegExp(`^${QUOTED_VALUE}$`).test(match)) {
      if (!settled.has(index) && reach.has(match.slice(1, -1))) hit(index);
      return null;
    }
    const plan = planOf(match, index);
    if (plan === null) return null;
    const spans = kind === 'swift'
      ? [...match.slice(plan.from).matchAll(/\.([a-z][A-Za-z0-9]*)/g)].map((q) => ({ start: index + plan.from + (q.index as number) + 1, length: (q[1] as string).length, value: q[1] as string, quoted: false }))
      : [...match.slice(plan.from).matchAll(/'([A-Za-z0-9][A-Za-z0-9-]*)'|"([A-Za-z0-9][A-Za-z0-9-]*)"/g)].map((q) => ({
          start: index + plan.from + (q.index as number),
          length: q[0].length,
          value: (q[1] ?? q[2]) as string,
          quoted: true,
        }));
    if (!isEnum(plan.scope, plan.prop) || spans.every((s) => settled.has(s.start))) return null;
    let out = '';
    let from = index;
    for (const s of spans) {
      settled.add(s.start);
      const to = valueIn(plan.scope, plan.prop, s.value);
      if (to === null) continue;
      const q = s.quoted ? text.charAt(s.start) : '';
      out += span(from, s.start) + q + to + q;
      from = s.start + s.length;
    }
    return from === index ? null : out + span(from, index + match.length);
  };

  const modifierAt: ValueRules['modifierAt'] = (stem, value, index) => {
    if (inRanges(comments, index)) return null;
    const scope = canonicalOfTag(`${v.cssFrom}-${stem}`, v.systemTags, v);
    if (scope === undefined) return null;
    const owners = [...(v.valueSets.get(scope) ?? [])].filter(([, list]) => list.includes(value)).map(([p]) => p);
    if (owners.length === 1) return valueIn(scope, owners[0] as string, value);
    if (owners.length > 1 && owners.some((p) => valueIn(scope, p, value) !== null)) hit(index);
    return null;
  };

  return { positional, replace, modifierAt, hits: () => [...found].sort((a, b) => a[0] - b[0]).map(([, s]) => s) };
}

/** Where a file's comments are. Quoted strings on one line are stepped over so `'a // b'` is not one; a template
 *  literal is not, because Lit's css`` and html`` hold real CSS comments. `://` is a URL, never a comment. */
function commentRanges(text: string, kind: FileKind): Range[] {
  const out: Range[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    const next = text.charAt(i + 1);
    if (c === '/' && (next === '*' || (next === '/' && kind !== 'css' && text.charAt(i - 1) !== ':'))) {
      const close = next === '*' ? text.indexOf('*/', i + 2) : text.indexOf('\n', i);
      const end = close === -1 ? text.length : next === '*' ? close + 2 : close;
      out.push({ start: i, end });
      i = end - 1;
    } else if (c === '"' || (c === "'" && kind !== 'swift')) {
      const close = text.indexOf(c, i + 1);
      const eol = text.indexOf('\n', i + 1);
      if (close !== -1 && (eol === -1 || close < eol)) i = close;
    }
  }
  return out;
}

function inRanges(ranges: Range[], index: number): boolean {
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const r = ranges[mid] as Range;
    if (index < r.start) hi = mid - 1;
    else if (index >= r.end) lo = mid + 1;
    else return true;
  }
  return false;
}

/** Just past the `}` that closes the `{` at `open`, stepping over comments and one-line strings. */
function braceEnd(text: string, open: number, commentEnd: Map<number, number>): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const skip = commentEnd.get(i);
    if (skip !== undefined) {
      i = skip - 1;
      continue;
    }
    const c = text.charAt(i);
    if (c === '"' || c === "'") {
      const close = text.indexOf(c, i + 1);
      const eol = text.indexOf('\n', i + 1);
      if (close !== -1 && (eol === -1 || close < eol)) i = close;
    } else if (c === '{') depth += 1;
    else if (c === '}' && --depth === 0) return i + 1;
  }
  return text.length;
}

/** The keys of the object literal whose `{` is at `open`, or null when its top level holds anything but
 *  `key: value` entries — a block, a destructuring, a CSS rule, a spread. */
function objectKeys(text: string, open: number, commentEnd: Map<number, number>): { start: number; name: string; quoted: boolean }[] | null {
  const keys: { start: number; name: string; quoted: boolean }[] = [];
  let depth = 0;
  let entry = open + 1;
  const take = (end: number): boolean => {
    let s = entry;
    for (;;) {
      while (s < end && /\s/.test(text.charAt(s))) s += 1;
      const skip = commentEnd.get(s);
      if (skip === undefined) break;
      s = skip;
    }
    if (s >= end) return true;
    const m = /^(?:([A-Za-z_$][A-Za-z0-9_$]*|[0-9][A-Za-z0-9]*)|'([A-Za-z0-9][A-Za-z0-9-]*)'|"([A-Za-z0-9][A-Za-z0-9-]*)")\s*:(?!:)/.exec(text.slice(s, Math.min(end, s + 200)));
    if (m === null) return false;
    keys.push({ start: s, name: (m[1] ?? m[2] ?? m[3]) as string, quoted: m[1] === undefined });
    return true;
  };
  for (let i = open + 1; i < text.length; i++) {
    const skip = commentEnd.get(i);
    if (skip !== undefined) {
      i = skip - 1;
      continue;
    }
    const c = text.charAt(i);
    if (c === '"' || c === "'" || c === '`') {
      const close = text.indexOf(c, i + 1);
      const eol = c === '`' ? -1 : text.indexOf('\n', i + 1);
      if (close !== -1 && (eol === -1 || close < eol)) i = close;
    } else if (c === '(' || c === '[' || c === '{') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
    else if (c === '}') {
      if (depth === 0) return take(i) ? keys : null;
      depth -= 1;
    } else if (depth === 0 && c === ';') return null;
    else if (depth === 0 && c === ',') {
      if (!take(i)) return null;
      entry = i + 1;
    }
  }
  return null;
}

/** A SwiftUI enum body's plain cases (`case primary, secondary`, `case ghost = "ghost"`), with where each name and
 *  raw string starts. A case with an associated value is not a plain case and is left out. */
function swiftCases(text: string, open: number, end: number): { start: number; name: string; raw: number | null }[] {
  const out: { start: number; name: string; raw: number | null }[] = [];
  const body = text.slice(open + 1, end - 1);
  for (const m of body.matchAll(/(?<![A-Za-z0-9_$.])case\s+([^\n]*)/g)) {
    const clause = m[1] as string;
    let offset = open + 1 + (m.index as number) + m[0].length - clause.length;
    for (const piece of (clause.split('//')[0] as string).split(',')) {
      const p = /^(\s*)([a-z][A-Za-z0-9]*)(\s*=\s*)?("[^"\n]*")?\s*$/.exec(piece);
      if (p !== null) {
        const start = offset + (p[1] as string).length;
        out.push({ start, name: p[2] as string, raw: p[4] === undefined ? null : start + (p[2] as string).length + (p[3] ?? '').length });
      }
      offset += piece.length + 1;
    }
  }
  return out;
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
  kebabPartAt: (name: string, index: number) => string | null,
  eventAt: (id: string, index: number) => string | null,
  modifierAt?: (stem: string, value: string, index: number) => string | null,
): string {
  if (match.startsWith('::part(') || GATE_HOOK.test(match)) return match; // a canonical gate hook, value and all
  if (match === v.pkgFrom) return v.pkgTo;
  // `attribute:` spells a prop; the two slot forms spell a part
  if (match.startsWith('attribute:')) return replaceQuoted(match, (name) => kebabPropAt(name, index) ?? name);
  if (match.startsWith('<slot') || match.startsWith('slot=')) return replaceQuoted(match, (name) => kebabPartAt(name, index) ?? name);
  if (match.startsWith('--') || match.startsWith(`${v.cssFrom}-`)) return renameCssName(match, v, index, kebabPartAt, modifierAt);
  if (/^[A-Z]/.test(match)) return protectedIdents.has(match) ? match : renamePascal(match, v);
  // In a stylesheet a bare word is a CSS property or keyword, never a prop: `gap:` is not `Stack.gap`.
  // A prop's spelling in CSS only ever shows up in a class name, which `renameCssName` has already done.
  if (kind === 'css') return match;
  if (match.includes('-')) return kebabPropAt(match, index) ?? match;
  if (protectedIdents.has(match)) return match;
  return eventAt(match, index) ?? propAt(match, index) ?? renameCamel(match, v);
}

/** The quoted value inside a matched attribute form, rewritten by `f`. */
function replaceQuoted(match: string, f: (value: string) => string): string {
  return match.replace(/(['"])([^'"]*)\1/, (_m, q: string, value: string) => `${q}${f(value)}${q}`);
}

/**
 * A dashed name carrying the namespace prefix. A custom property takes the new prefix and nothing else —
 * the rest of a hook name mirrors the canonical binding, which is what themes/nimbus/naming.md promises.
 * A class or custom-element name is the component's own spelling, so its stem and `__part` follow too, and a
 * modifier that is one of the component's enum values follows `values` (`ds-button--primary` → `acme-cta-button--cta`).
 */
function renameCssName(
  match: string,
  v: Vocab,
  index: number,
  kebabPartAt: (name: string, index: number) => string | null,
  modifierAt?: (stem: string, value: string, index: number) => string | null,
): string {
  const custom = match.startsWith('--');
  const rest = (custom ? match.slice(2) : match).slice(v.cssFrom.length + 1);
  if (custom) return `--${v.cssTo}-${rest}`;
  const modifier = rest.indexOf('--');
  const head = modifier === -1 ? rest : rest.slice(0, modifier);
  let tail = modifier === -1 ? '' : rest.slice(modifier);
  const under = head.indexOf('__');
  let stem = under === -1 ? head : head.slice(0, under);
  const value = modifierAt === undefined ? undefined : /^--([A-Za-z0-9][A-Za-z0-9-]*)$/.exec(tail)?.[1];
  if (value !== undefined) tail = `--${modifierAt?.(stem, value, index) ?? value}`;
  const part = under === -1 ? '' : head.slice(under + 2);
  for (const [from, to] of v.kebabs) {
    if (stem === from || stem.startsWith(`${from}-`)) {
      stem = to + stem.slice(from.length);
      break;
    }
  }
  const renamedPart = part === '' ? '' : `__${kebabPartAt(part, index) ?? part}`;
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

/** Names as one regex alternation, longest first. */
function alternation(names: string[]): string {
  return [...names].sort((a, b) => b.length - a.length).map(escape).join('|');
}

/** `Button.stories.tsx` → `CtaButton.stories.tsx`, `Gallery+Button.swift` → `Gallery+CtaButton.swift`. */
export function renameFileName(name: string, v: Vocab): string {
  return name.replace(new RegExp(`${BEFORE}[A-Z][A-Za-z0-9]*`, 'g'), (id) => renamePascal(id, v));
}

// ---------------------------------------------------------------- applying it to a tree

/** What a rename did: the files whose text changed, the files that moved, and — only when there are any — the enum
 *  values it left alone because no context tied them to one prop (`<file>:<line>: <trimmed line>`), and the
 *  compatibility layer's files it wrote (`brand`) or deleted (`canonical`), as `naming-compat/<file>`. */
export type Applied = { edited: string[]; renames: [from: string, to: string][]; ambiguous?: string[]; compat?: string[] };

/** Folders a generated file never lives in, the one folder that is hand-written, and the one the compatibility layer
 *  owns, which no rewrite reads: it is written after the rename and deleted before the revert. */
const SKIP_DIRS: ReadonlySet<string> = new Set(['custom', 'node_modules', 'dist', '__snapshots__', 'naming-compat']);

function walk(dir: string, out: string[] = []): string[] {
  for (const e of sortedNames(readdirSync(dir))) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(e)) walk(full, out);
    } else out.push(full);
  }
  return out;
}

export type RenameOptions = {
  /** Write (`brand`) or delete (`canonical`) the aliases' compatibility layer in `naming-compat/`. Default true; the
   *  pattern demo pages beside a package source are renamed without one. */
  compat?: boolean;
};

/**
 * Rename one folder of generated code in place. Idempotent in both directions: `brand` twice changes
 * nothing the second time, and `canonical` afterwards restores exactly the bytes that were there before.
 *
 * With `compat`, `brand` renames first and then writes `naming-compat/` from the doc's aliases, replacing a previous
 * copy; `canonical` deletes the folder before it renames anything. Both refuse a folder holding a file without the
 * marker line, and `brand` refuses an alias the platform cannot carry before a single file moves.
 */
export function rename(dir: string, res: Resolution, direction: Direction, platform: string, dryRun: boolean = false, options: RenameOptions = {}): Applied {
  const applied: Applied = { edited: [], renames: [] };
  if (isNoop(res) || !existsSync(dir)) return applied;
  const compat = options.compat ?? true;
  const files = walk(dir);
  const v = vocab(res, platform, direction, files.map((f) => fileStem(f)));
  const ambiguous: string[] = [];
  const key = (f: string): string => relative(dir, f).replaceAll('\\', '/');
  const existing = compat ? existingCompat(dir) : [];
  const planned = compat && direction === 'brand' ? compatFiles(res, platform, new Set(files.map((f) => key(join(dirname(f), renameFileName(basename(f), v)))))) : {};
  if (compat && direction === 'canonical' && existing.length > 0) {
    if (!dryRun) rmSync(join(dir, COMPAT_DIR), { recursive: true, force: true });
    applied.compat = existing;
  }
  for (const file of files) {
    const kind = fileKind(file);
    const before = kind === 'other' ? '' : readFileSync(file, 'utf8');
    const hits: string[] = [];
    const after = kind === 'other' ? '' : rewrite(before, v, file, hits);
    for (const hit of hits) ambiguous.push(`${key(file)}:${hit}`);
    const target = join(dirname(file), renameFileName(basename(file), v));
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
  if (ambiguous.length > 0) applied.ambiguous = ambiguous;
  if (compat && direction === 'brand') {
    const names = pySorted(Object.keys(planned));
    if (!dryRun && (existing.length > 0 || names.length > 0)) {
      rmSync(join(dir, COMPAT_DIR), { recursive: true, force: true });
      for (const name of names) {
        const file = join(dir, COMPAT_DIR, name);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, planned[name] as string, 'utf8');
      }
    }
    if (names.length > 0) applied.compat = names.map((name) => `${COMPAT_DIR}/${name}`);
  }
  return applied;
}

// ---------------------------------------------------------------- the compatibility layer (aliases)

/** The folder inside a platform's source that the compatibility layer owns. */
export const COMPAT_DIR = 'naming-compat';

/** The first line of every file in naming-compat/: what wrote it, and what --revert does with it. */
export function compatMarker(source: string): string {
  return `// Generated by tools/naming.ts from ${source} (aliases). Do not edit; --revert deletes this folder.`;
}

const COMPAT_MARKER = /^\/\/ Generated by tools\/naming\.ts from .+ \(aliases\)\. Do not edit; --revert deletes this folder\.\r?$/;

/** What naming-compat/ holds now, as `naming-compat/<file>`. Every file has to carry the marker: a file without it is
 *  somebody's hand-written code, and no run deletes that. */
function existingCompat(dir: string): string[] {
  const folder = join(dir, COMPAT_DIR);
  if (!existsSync(folder)) return [];
  const files: string[] = [];
  const collect = (at: string): void => {
    for (const name of sortedNames(readdirSync(at))) {
      const full = join(at, name);
      if (statSync(full).isDirectory()) collect(full);
      else files.push(full);
    }
  };
  collect(folder);
  for (const file of files) {
    if (!COMPAT_MARKER.test(readFileSync(file, 'utf8').split('\n', 1)[0] ?? '')) {
      throw new NamingError(
        `✖ ${rel(file)} does not start with the "// Generated by tools/naming.ts" marker. ${COMPAT_DIR}/ belongs to ` +
          `tools/naming.ts, which never deletes a hand-written file: move it out of ${COMPAT_DIR}/, then run the rename again.`,
      );
    }
  }
  return files.map((f) => relative(dir, f).replaceAll('\\', '/'));
}

/** Only the entries that reach `platform`, with the props and values left with none dropped. */
function forPlatform(a: CompatAliases, platform: string): CompatAliases {
  const reach = (uses: AliasUse[]): AliasUse[] => uses.filter((u) => appliesTo(u.entry, platform));
  return {
    current: a.current,
    components: reach(a.components),
    props: a.props.map((p) => ({ ...p, aliases: reach(p.aliases) })).filter((p) => p.aliases.length > 0),
    values: a.values.map((x) => ({ ...x, aliases: reach(x.aliases) })).filter((x) => x.aliases.length > 0),
  };
}

/** Whether the folder will hold the component module a compat module imports. The naming demo holds three components,
 *  not the package, and an import of a module that is not there would not compile. */
function hasModule(available: ReadonlySet<string>, platform: string, name: string): boolean {
  if (platform === 'swiftui') return [...available].some((f) => basename(f) === `${name}.swift`);
  if (platform === 'lit') return available.has(`${name}.ts`);
  return available.has(`${name}.tsx`) || available.has(`${name}.ts`);
}

/**
 * The compatibility layer for one platform: file name inside naming-compat/ → text. One module per component with an
 * alias that reaches the platform, plus an `index.ts` barrel (none for Swift). `available` is what the platform folder
 * will hold after the rename, relative to it; `null` emits for every aliased component.
 */
export function compatFiles(res: Resolution, platform: string, available: ReadonlySet<string> | null = null): Record<string, string> {
  assertAliasesSupported(res, platform);
  const source = res.source === null ? 'naming.md' : rel(res.source);
  const out: Record<string, string> = {};
  for (const component of pySorted(Object.keys(res.aliases))) {
    const a = forPlatform(res.aliases[component] as CompatAliases, platform);
    if (a.components.length + a.props.length + a.values.length === 0) continue;
    if (available !== null && !hasModule(available, platform, a.current)) continue;
    if (platform === 'swiftui') out[`${a.current}.swift`] = swiftModule(a, source);
    else if (platform === 'lit') out[`${a.current}.ts`] = litModule(res, a, source);
    else out[`${a.current}.ts`] = tsModule(platform, a, source);
  }
  const modules = Object.keys(out);
  if (modules.length > 0 && platform !== 'swiftui') {
    const suffix = platform === 'lit' ? '.js' : '';
    out['index.ts'] = [compatMarker(source), ...modules.map((m) => `export * from './${m.replace(/\.ts$/, '')}${suffix}';`), ''].join('\n');
  }
  return out;
}

/** `since 2.0.0`, from an entry's own `since` or its deprecation's, or nothing. */
function sinceText(uses: AliasUse[]): string {
  const versions = pySorted([...new Set(uses.map((u) => u.entry.since ?? u.entry.deprecated?.since).filter((s): s is string => s !== undefined))]);
  return versions.length === 0 ? '' : `since ${versions.join(' and ')}`;
}

function reasonText(use: AliasUse): string {
  const reason = use.entry.deprecated?.reason;
  return reason === undefined ? '' : ` ${reason}`;
}

/** The dev-only warning: `CtaButton: \`kind\` is deprecated since 2.0.0; use \`emphasis\`.`, then 624's reason. */
export function aliasMessage(current: string, old: string, now: string, use: AliasUse): string {
  const since = sinceText([use]);
  return `${current}: \`${old}\` is deprecated${since === '' ? '' : ` ${since}`}; use \`${now}\`.${reasonText(use)}`;
}

/** A `@deprecated` tag's text: `since 2.0.0; use \`emphasis\`.` */
function deprecatedTag(uses: AliasUse[], advice: string): string {
  const since = sinceText(uses);
  const reasons = uses.length === 1 ? reasonText(uses[0] as AliasUse) : '';
  return `@deprecated ${since === '' ? '' : `${since}; `}${advice}${reasons}`.replaceAll('*/', '* /');
}

function quote(text: string): string {
  return `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'").replaceAll('\n', '\\n')}'`;
}

function codeList(names: string[]): string {
  const ticked = names.map((n) => `\`${n}\``);
  return ticked.length <= 1 ? (ticked[0] ?? '') : `${ticked.slice(0, -1).join(', ')} and ${ticked[ticked.length - 1] as string}`;
}

/**
 * Web and React Native: the component's old names as `const` and type aliases, and — when a prop or value is aliased —
 * a wrapper of the component's own name that takes the old spellings, maps them onto the current ones (a current prop
 * passed explicitly wins) and warns once per alias in development, the way each package already checks for it.
 */
function tsModule(platform: string, a: CompatAliases, source: string): string {
  const web = platform === 'web';
  const cur = a.current;
  const base = `${cur}Base`;
  const baseProps = `${cur}BaseProps`;
  const componentProps = web ? 'ComponentProps' : 'React.ComponentProps';
  const mapped = [...new Set([...a.props.map((p) => p.prop), ...a.values.map((x) => x.prop)])].map((prop) => ({
    current: a.props.find((p) => p.prop === prop)?.current ?? a.values.find((x) => x.prop === prop)?.currentProp ?? prop,
    propAliases: a.props.find((p) => p.prop === prop)?.aliases ?? [],
    valueAliases: a.values.filter((x) => x.prop === prop).flatMap((x) => x.aliases.map((use) => ({ now: x.current, use }))),
  }));
  const lines: string[] = [compatMarker(source)];
  if (mapped.length === 0) {
    lines.push(web ? "import type { ComponentProps } from 'react';" : "import type * as React from 'react';", `import { ${cur} } from '../${cur}';`, '');
  } else {
    const uses = [...a.props.flatMap((p) => p.aliases), ...a.values.flatMap((x) => x.aliases)];
    const oldNames = codeList(uses.map((u) => u.entry.name));
    const value = (current: string): string => `${current}Value`;
    const chosen = (current: string): string => `${current}Chosen`;
    const valueType = (current: string): string => `${current.charAt(0).toUpperCase()}${current.slice(1)}Value`;
    lines.push(
      web ? "import { createElement, type ComponentProps, type ReactElement } from 'react';" : "import * as React from 'react';",
      `import { ${cur} as ${base} } from '../${cur}';`,
      '',
    );
    if (web) {
      lines.push(
        '/* Only declared when the bundler defines it; never assumed. */',
        'declare const process: { env: Record<string, string | undefined> } | undefined;',
        "const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';",
        '',
      );
    }
    lines.push(`type ${baseProps} = ${componentProps}<typeof ${base}>;`);
    for (const m of mapped) if (m.valueAliases.length > 0) lines.push(`type ${valueType(m.current)} = NonNullable<${baseProps}['${m.current}']>;`);
    const widened = mapped.filter((m) => m.valueAliases.length > 0).map((m) => `'${m.current}'`);
    lines.push(
      '',
      '/**',
      ` * ${cur}'s props, with the old spellings ${source} keeps working: ${oldNames}.`,
      ` * ${deprecatedTag(uses, `pass the current names and import ${cur}'s own props from the package.`)}`,
      ' */',
      `export type ${cur}Props = ${widened.length === 0 ? baseProps : `Omit<${baseProps}, ${widened.join(' | ')}>`} & {`,
    );
    for (const m of mapped) {
      const olds = m.valueAliases.map((x) => `'${x.use.entry.name}'`);
      const type = olds.length === 0 ? `${baseProps}['${m.current}']` : `${valueType(m.current)} | ${olds.join(' | ')} | undefined`;
      if (olds.length > 0) {
        lines.push(`  /** Also takes the old value${olds.length === 1 ? '' : 's'} ${codeList(m.valueAliases.map((x) => x.use.entry.name))}, deprecated. */`, `  ${m.current}?: ${type};`);
      }
      for (const use of m.propAliases) lines.push(`  /** ${deprecatedTag([use], `use \`${m.current}\`.`)} */`, `  ${use.entry.name}?: ${type};`);
    }
    lines.push(
      '};',
      '',
      'const warned = new Set<string>();',
      '',
      'function warnOnce(key: string, message: string): void {',
      `  if (!${web ? 'isDev' : '__DEV__'} || warned.has(key)) return;`,
      '  warned.add(key);',
      '  console.warn(message);',
      '}',
      '',
      '/**',
      ` * ${cur}, taking the old spellings ${oldNames} and passing the current ones on.`,
      ` * ${deprecatedTag(uses, `import ${cur} from the package once callers use the current names.`)}`,
      ' */',
    );
    const binds = mapped.flatMap((m) => [`${m.current}: ${value(m.current)}`, ...m.propAliases.map((u) => `${u.entry.name}: ${value(u.entry.name)}`)]);
    lines.push(`export function ${cur}({ ${binds.join(', ')}, ...rest }: ${cur}Props): ${web ? 'ReactElement' : 'React.JSX.Element'} {`);
    for (const m of mapped) {
      for (const use of m.propAliases) {
        lines.push(`  if (${value(use.entry.name)} !== undefined) warnOnce(${quote(use.entry.name)}, ${quote(aliasMessage(cur, use.entry.name, m.current, use))});`);
      }
    }
    for (const m of mapped) {
      lines.push(`  const ${chosen(m.current)} = ${[m.current, ...m.propAliases.map((u) => u.entry.name)].map(value).join(' ?? ')};`);
      for (const x of m.valueAliases) {
        lines.push(`  if (${chosen(m.current)} === '${x.use.entry.name}') warnOnce(${quote(`${m.current}=${x.use.entry.name}`)}, ${quote(aliasMessage(cur, x.use.entry.name, x.now, x.use))});`);
      }
    }
    lines.push(`  const props: ${baseProps} = { ...rest };`);
    for (const m of mapped) {
      const mapping = m.valueAliases.map((x) => `${chosen(m.current)} === '${x.use.entry.name}' ? '${x.now}' : `).join('');
      lines.push(`  if (${chosen(m.current)} !== undefined) props.${m.current} = ${mapping}${chosen(m.current)};`);
    }
    lines.push(`  return ${web ? 'createElement' : 'React.createElement'}(${base}, props);`, '}', '');
  }
  for (const use of a.components) {
    const props = mapped.length === 0 ? `${componentProps}<typeof ${cur}>` : `${cur}Props`;
    lines.push(
      `/** ${deprecatedTag([use], `use \`${cur}\`.`)} */`,
      `export const ${use.entry.name}: typeof ${cur} = ${cur};`,
      `/** ${deprecatedTag([use], `use \`${cur}\`'s props.`)} */`,
      `export type ${use.entry.name}Props = ${props};`,
      '',
    );
  }
  return `${lines.join('\n').replace(/\n+$/, '')}\n`;
}

/** Lit: each old name a subclass of the current element, registered under its old tag once, warning on connect. */
function litModule(res: Resolution, a: CompatAliases, source: string): string {
  const prefix = pascalPrefix(res.cssPrefix);
  const baseClass = `${prefix}${a.current}`;
  const baseTag = `${res.cssPrefix}-${kebab(a.current)}`;
  const lines: string[] = [compatMarker(source), `import { ${baseClass} } from '../${a.current}.js';`, ''];
  const tags: string[] = [];
  for (const use of a.components) {
    const cls = `${prefix}${use.entry.name}`;
    const tag = `${res.cssPrefix}-${kebab(use.entry.name)}`;
    const flag = `warned${use.entry.name}`;
    lines.push(
      `let ${flag} = false;`,
      '',
      '/**',
      ` * \`<${tag}>\`, the old name of \`<${baseTag}>\`, kept working by ${source}.`,
      ` * ${deprecatedTag([use], `use \`<${baseTag}>\` (${baseClass}).`)}`,
      ' */',
      `export class ${cls} extends ${baseClass} {`,
      '  override connectedCallback(): void {',
      '    super.connectedCallback();',
      `    if (import.meta.env.DEV && !${flag}) {`,
      `      ${flag} = true;`,
      `      console.warn(${quote(aliasMessage(a.current, `<${tag}>`, `<${baseTag}>`, use))}, this);`,
      '    }',
      '  }',
      '}',
      '',
      `if (!customElements.get('${tag}')) customElements.define('${tag}', ${cls});`,
      '',
    );
    tags.push(`    '${tag}': ${cls};`);
  }
  lines.push('declare global {', '  interface HTMLElementTagNameMap {', ...tags, '  }', '}');
  return `${lines.join('\n')}\n`;
}

/** SwiftUI: each old name a deprecated typealias, which the compiler itself offers to rename. */
function swiftModule(a: CompatAliases, source: string): string {
  const lines: string[] = [compatMarker(source)];
  for (const use of a.components) {
    const since = sinceText([use]);
    lines.push(
      `/// \`${use.entry.name}\`, the old name of \`${a.current}\`, kept working by ${source}: deprecated${since === '' ? '' : ` ${since}`}.${reasonText(use)}`,
      `@available(*, deprecated, renamed: "${a.current}") public typealias ${use.entry.name} = ${a.current}`,
    );
  }
  return `${lines.join('\n')}\n`;
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
    `naming ${rel(res.source as string)}: ${Object.keys(res.components).length} component(s), ${Object.keys(res.props).length} prop(s), ` +
      `${Object.keys(res.naming.events).length} event(s), ${Object.values(res.anatomy).reduce((n, parts) => n + Object.keys(parts).length, 0)} anatomy part(s), ` +
      `${Object.values(res.values).reduce((n, props) => n + Object.values(props).reduce((m, renames) => m + Object.keys(renames).length, 0), 0)} value(s), ` +
      `${Object.keys(res.tokens.rename).length} token rename(s), ` +
      `--${res.cssPrefix}- prefix${res.tokens.cssPrefix === undefined ? '' : `, --${res.tokens.cssPrefix}- token prefix`}\n`,
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
    for (const warning of [...collisions(res, platform), ...notices(res, platform)]) process.stdout.write(`  ! ${platform}: ${warning}\n`);
    for (const folder of dir === null ? generatedDirs(platform) : [resolvePath(paths.ROOT, dir)]) {
      // the compatibility layer belongs to the package source, never to the pattern demo pages beside it
      const compat = dir !== null || folder !== demoDir(paths.ROOT, platform);
      const applied = rename(folder, res, direction, platform, mode === 'check', { compat });
      const written = direction === 'brand' ? 'write' : 'delete';
      const layer = applied.compat === undefined ? '' : `, ${mode === 'check' ? `would ${written}` : `${written === 'write' ? 'wrote' : 'deleted'}`} ${applied.compat.length} compat file(s)`;
      process.stdout.write(`  ${platform} ${rel(folder)}: ${verb} ${applied.edited.length} file(s), ${applied.renames.length} move(s)${layer}\n`);
      for (const [from, to] of applied.renames.slice(0, 12)) process.stdout.write(`      ${from} → ${to}\n`);
      if (applied.renames.length > 12) process.stdout.write(`      … ${applied.renames.length - 12} more\n`);
      for (const file of applied.compat ?? []) process.stdout.write(`      ${direction === 'brand' ? '+' : '-'} ${file}\n`);
      for (const hit of applied.ambiguous ?? []) process.stdout.write(`  ! ${platform}: ambiguous value ${rel(folder)}/${hit}\n`);
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
