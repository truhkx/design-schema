/**
 * Naming frontmatter schema (Zod) — the single source of truth for a brand's names.
 *
 * A naming doc (`themes/<brand>/naming.md`) is a *sibling* of a theme doc, never an edit to a
 * canonical component doc: a theme tailors the look, a naming doc tailors the identifiers the
 * generators emit. See site/src/content/docs/process/customization-and-naming.md for why the two
 * are separate files (it is also what makes an upstream pull conflict-free).
 *
 * What it renames: generated *output* identifiers only — the package scope, the CSS
 * custom-property prefix, per-platform type-name prefixes, component names, prop/anatomy names, and
 * (`tokens`, job 628) the names the token build emits: a token's CSS variable and its JS/RN/Swift key.
 * What it never touches: the canonical schema's own keys (`props.variant`, `a11y.role`), and a
 * token's dotted path (`color.action.primary.background`), which stays canonical in generated/, the
 * built JSON, `TokenRef` and every doc even where `tokens` changes the emitted name. The gates key off
 * those, so they stay fixed across every fork and never need to know a brand called `Button` something else.
 *
 * Every key is optional and every default is Design Schema's own vocabulary, so a brand that
 * writes no naming.md at all — the default, unrenamed case — parses to an object that renames
 * nothing. Consumers can read `naming.namespace.cssPrefix` unconditionally.
 *
 * `node tools/schema.ts` derives ./naming.schema.json from this file with `z.toJSONSchema`
 * (never edit the JSON by hand), the same way it derives ./component.schema.json.
 *
 * Zod 4, imported from `zod` so Node can run the tools without a build step.
 */
import { z } from 'zod';

import { deprecation, platformId, sinceVersion } from './component.ts';

/** A generated type/struct/class identifier: PascalCase. */
const typeName = z.string().regex(/^[A-Z][A-Za-z0-9]*$/, 'Expected a PascalCase identifier like CtaButton');
/** A generated prop or anatomy identifier: camelCase. */
const memberName = z.string().regex(/^[a-z][A-Za-z0-9]*$/, 'Expected a camelCase identifier like style');
/** A naming map's key: a canonical member name, global (`variant`) or scoped to a component (`Button.variant`). */
const memberKey = (what: string, example: string) =>
  z.string().regex(/^([A-Z][A-Za-z0-9]*\.)?[a-z][A-Za-z0-9]*$/, `Expected ${what}, global (${example}) or scoped to a component (Button.${example})`);

/** The platforms whose generated type names carry a prefix `namespace.typePrefix` can set. */
export const TYPE_PREFIX_PLATFORMS = ['rn', 'swiftui'] as const;

/** A brand's neutral event name: `onActivate`. */
const eventName = z.string().regex(/^on[A-Z][A-Za-z0-9]*$/, 'Expected a neutral event name like onActivate');
/** A camelCase emitted event name (web, React Native): `onActivate`. */
const emittedCamel = memberName;
/** A Lit CustomEvent name: lowercase kebab, `activate`, `open-change`. */
const emittedKebab = z.string().regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, 'Expected a lowercase kebab event name like open-change');

/** An enum value, canonical or brand: it has to survive a CSS modifier class (`ds-button--primary`) and a Lit
 *  attribute selector (`[variant='primary']`), so letters, digits and inner dashes only. */
export const enumValueName = /^[A-Za-z0-9][A-Za-z0-9-]*$/;
const valueName = z.string().regex(enumValueName, 'Expected an enum value like primary or 2xl: letters, digits and -');

/** The platforms an event rename reaches, as they are spelled in the object form. */
export const EVENT_RENAME_PLATFORMS = ['web', 'lit', 'rn'] as const;

export const eventRename = z
  .union([
    eventName,
    z
      .strictObject({
        web: emittedCamel.optional(),
        lit: emittedKebab.optional(),
        rn: emittedCamel.optional(),
        // Declared so the refusal can say why, rather than strictObject's "Unrecognized key". Refused in a
        // non-aborting check, not with z.never: an aborting failure in both union branches hides the
        // message behind "Invalid input".
        swiftui: z.unknown().optional(),
      })
      .check((ctx) => {
        if (ctx.value.swiftui !== undefined) {
          ctx.issues.push({
            code: 'custom',
            continue: true,
            input: ctx.value.swiftui,
            path: ['swiftui'],
            message: "event renames reach web, lit and rn; SwiftUI's emitted names are argument labels the rename cannot scope yet",
          });
        }
      }),
  ])
  .describe(
    "A string (onActivate) is the brand's neutral name: web and React Native emit it as written and Lit as its kebab form (activate), on each platform whose canonical emitted name follows that convention. An object ({ web: onActivate, lit: activate, rn: onActivate }) gives the exact emitted name per platform and reaches exactly the platforms it lists.",
  );

/** One old spelling of a current name, kept working beside it and marked deprecated. The fields after `name` are
 *  job 624's lifecycle vocabulary, imported rather than restated, so an alias dates and explains itself the way a
 *  deprecated prop does. */
const aliasEntry = (name: z.ZodString) =>
  z.strictObject({
    name,
    since: sinceVersion.optional().describe('The package version from which the old name is deprecated.'),
    deprecated: deprecation.optional().describe('Why callers should move off the old name; its reason is appended to the dev-only warning.'),
    platforms: z
      .array(platformId)
      .min(1)
      .optional()
      .describe('The platforms the compatibility layer keeps the old name working on. Omitted means every platform; an entry whose kind a platform cannot support has to list the ones that can.'),
  });

export const aliasesDef = z
  .strictObject({
    components: z
      .record(typeName, z.array(aliasEntry(typeName)))
      .optional()
      .describe('Canonical component → its old names (Button: [{ name: ActionButton, since: 2.0.0 }]). Supported on every platform.'),
    props: z
      .record(memberKey('a prop', 'variant'), z.array(aliasEntry(memberName)))
      .optional()
      .describe('A props-style key, global (variant) or scoped to a component (Button.variant) → its old names. Supported on web and rn.'),
    values: z
      .record(memberKey('an enum prop', 'variant'), z.record(valueName, z.array(aliasEntry(valueName))))
      .optional()
      .describe('A values-style key → canonical value → its old names. Supported on web and rn.'),
  })
  .meta({ id: 'aliasesDef' });

export type AliasEntry = z.infer<ReturnType<typeof aliasEntry>>;
export type AliasesDef = z.infer<typeof aliasesDef>;

/** The alias kinds, and the platforms whose compatibility layer can carry each one. */
export const ALIAS_SUPPORT: Record<'components' | 'props' | 'values', readonly string[]> = {
  components: ['web', 'lit', 'rn', 'swiftui'],
  props: ['web', 'rn'],
  values: ['web', 'rn'],
};

/** A CSS custom-property prefix, written without the leading `--` or trailing `-`: `acme`, `acme-ui`. */
const cssPrefixName = z.string().regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, 'Expected a lowercase prefix like acme, written without the leading -- or trailing -');

/** A token's dotted path, canonical or brand: `color.action.primary.background`, `font.size.2xl`. The first segment
 *  starts with a letter, so the emitted JS key is an identifier; no segment starts with a capital, so the emitted CSS
 *  name, which kebab-cases at a capital, cannot be spelled two ways. Every public name in schema/tokens.ts matches. */
export const tokenPathName = /^[a-z][A-Za-z0-9]*(\.[a-z0-9][A-Za-z0-9]*)*$/;
const tokenPath = z.string().regex(tokenPathName, 'Expected a dotted token path like color.action.primary.background');

const TOKENS_CANONICAL = 'The dotted path stays canonical everywhere a tool reads it; only the emitted CSS variable and JS/RN/Swift key change.';

export const tokensDef = z
  .strictObject({
    cssPrefix: cssPrefixName
      .optional()
      .describe(`Prefix on every emitted token custom property, written without the leading -- or trailing -: acme → --acme-color-foreground. Absent keeps token variables unprefixed. JS, React Native and Swift keys never take it. ${TOKENS_CANONICAL}`),
    rename: z
      .record(tokenPath, tokenPath)
      .optional()
      .describe(`Canonical public token name (no trailing .default) → the brand's dotted path, which the token build emits instead: color.action.primary.background: color.brand.primary gives --color-brand-primary and colorBrandPrimary. ${TOKENS_CANONICAL}`),
  })
  .meta({ id: 'tokensDef' });

export const namespaceDef = z
  .strictObject({
    /** The npm scope generated packages publish under: `@acme` → `@acme/react`, `@acme/lit`. */
    package: z
      .string()
      .regex(/^@[a-z0-9][a-z0-9._-]*$/, "Expected an npm scope like @acme (leading @, no slash)")
      .default('@design-schema')
      .describe('npm scope for the generated packages: @acme → @acme/react, @acme/lit, @acme/tokens.'),
    /** The CSS custom-property prefix, without the leading `--` or trailing `-`: `acme` → `--acme-button-background`. */
    cssPrefix: cssPrefixName
      .default('ds')
      .describe('CSS custom-property prefix, written without the leading -- or trailing -: acme → --acme-button-background.'),
    /** Per-platform prefix on generated type names, for the platforms that have one. */
    typePrefix: z
      .partialRecord(platformId, typeName)
      .default({})
      .describe(`Per-platform prefix on generated type names where one exists (SwiftUI's DesignSchemaTokens module and its TokenRef enum, React Native's theme context). Only ${TYPE_PREFIX_PLATFORMS.join(' and ')} have prefixed type names (TYPE_PREFIX_PLATFORMS); another platform's key parses but renames nothing. A platform left out keeps the canonical name.`),
  })
  .meta({ id: 'namespaceDef' });

export const namingDef = z
  .strictObject({
    // `prefault`, not `default`: the empty object is parsed, so `package`/`cssPrefix` fill in too.
    namespace: namespaceDef
      .prefault({})
      .describe("The vocabulary around the components: package scope, CSS custom-property prefix, per-platform type-name prefix."),
    /** Canonical component name → brand name: `Button: CtaButton`. */
    components: z
      .record(typeName, typeName)
      .default({})
      .describe('Canonical component name → brand name (Button: CtaButton). Applies to the generated file name, the exported type, and every reference from a composite. Components left out keep their canonical name.'),
    /** Canonical prop or anatomy name → brand name, global (`variant`) or per component (`Button.variant`). */
    props: z
      .record(z.string().regex(/^([A-Z][A-Za-z0-9]*\.)?[a-z][A-Za-z0-9]*$/, "Expected a prop or anatomy name, global (variant) or scoped to a component (Button.variant)"), memberName)
      .default({})
      .describe('Canonical prop or anatomy name → brand name. A bare key (variant: style) renames it on every component; a dotted key (Button.variant: style) renames it on one, and wins over the bare key for that component.'),
    /** Canonical neutral event name → the brand's event names: `Button.onPress: { web: onActivate, lit: activate, rn: onActivate }`. */
    events: z
      .record(memberKey('a neutral event name', 'onPress'), eventRename)
      .default({})
      .describe("Canonical neutral event name → the name each platform emits instead, global (onPress) or scoped to a component (Button.onPress). The rename reaches what generated code actually emits (eventDef.platforms), which is not always the key: Button's onPress is onClick on web and press on Lit. Event renames reach web, lit and rn."),
    /** Canonical anatomy part → brand part: `Button.trailingIcon: endIcon`. */
    anatomy: z
      .record(memberKey('an anatomy part', 'label'), memberName)
      .default({})
      .describe("Canonical anatomy part → brand part, global (label) or scoped to a component (Button.label). Renames the part's own spellings — the class __part segment and Lit's slot names — and never an identifier, so a prop with the same name keeps its own."),
    /** Canonical enum prop → canonical value → brand value: `Button.variant: { primary: cta }`. */
    values: z
      .record(memberKey('an enum prop', 'variant'), z.record(valueName, valueName))
      .default({})
      .describe("Canonical enum prop → canonical value → brand value, global (variant) or scoped to a component (Button.variant). The key is always the canonical prop name, even where props renames the prop. Resolved per component, per prop, per value: a dotted key's entry wins over the bare key's for the same value, and the two merge otherwise, so tone: { danger: critical } and Alert.tone: { info: notice } give Alert both. A value moves only where the code ties it to its prop; token paths never move, and a literal the rename cannot prove is reported, not guessed."),
    /** Old names kept working beside the current ones: `components: { Button: [{ name: ActionButton, since: '2.0.0' }] }`. */
    aliases: aliasesDef
      .default({})
      .describe("An adopter's old names, kept working next to the current ones and marked deprecated. Keys are always canonical names, like every other map; an alias names the old spelling of the current name, which is the brand name where this doc renames it. tools/naming.ts writes the compatibility layer into naming-compat/ inside the platform's source folder when it applies the rename, and --revert deletes it."),
    /** The names the token build emits: `cssPrefix: acme`, `rename: { color.action.primary.background: color.brand.primary }`. */
    tokens: tokensDef
      .default({})
      .describe(`The names tokens/build.mjs emits for an adopter whose stylesheets and code already use their own token names: a prefix on every CSS variable, and a brand dotted path per renamed token. ${TOKENS_CANONICAL} tools/naming.ts moves the emitted names in generated code with the rest of the rename.`),
  })
  .check((ctx) => {
    const { components, props, events, anatomy, values, aliases, tokens } = ctx.value;
    // Two tokens emitted under one brand path would be one CSS variable and one JS key.
    const seenToken = new Map<string, string>();
    for (const [canonical, brand] of Object.entries(tokens.rename ?? {})) {
      const first = seenToken.get(brand);
      if (first !== undefined) {
        ctx.issues.push({ code: 'custom', input: brand, path: ['tokens', 'rename', canonical], message: `${canonical} and ${first} both rename to ${brand}` });
      } else seenToken.set(brand, canonical);
    }
    // Two canonical names renamed onto one brand name would generate two files with the same
    // name, or two props the generator cannot tell apart. Catch it here, not at the templating step.
    const seenComponent = new Map<string, string>();
    for (const [canonical, brand] of Object.entries(components)) {
      const first = seenComponent.get(brand);
      if (first !== undefined) {
        ctx.issues.push({ code: 'custom', input: brand, path: ['components', canonical], message: `${canonical} and ${first} both rename to ${brand}` });
      } else seenComponent.set(brand, canonical);
    }
    const seenProp = new Map<string, string>();
    for (const [canonical, brand] of Object.entries(props)) {
      const scope = canonical.includes('.') ? (canonical.split('.')[0] as string) : '';
      const key = `${scope}.${brand}`;
      const first = seenProp.get(key);
      if (first !== undefined) {
        ctx.issues.push({ code: 'custom', input: brand, path: ['props', canonical], message: `${canonical} and ${first} both rename to ${brand}` });
      } else seenProp.set(key, canonical);
    }
    const seenPart = new Map<string, string>();
    for (const [canonical, brand] of Object.entries(anatomy)) {
      const key = `${scopeOf(canonical)}.${brand}`;
      const first = seenPart.get(key);
      if (first !== undefined) {
        ctx.issues.push({ code: 'custom', input: brand, path: ['anatomy', canonical], message: `${canonical} and ${first} both rename to ${brand}` });
      } else seenPart.set(key, canonical);
    }
    // A string names the neutral event, so it compares per scope as a prop does; the object form names
    // what one platform emits, so it compares per scope and platform. The two forms against each other
    // depend on what each platform emits canonically, which tools/naming.ts checks when it resolves.
    const seenEvent = new Map<string, string>();
    for (const [canonical, brand] of Object.entries(events)) {
      const pairs: [string, string][] = typeof brand === 'string'
        ? [['', brand]]
        : EVENT_RENAME_PLATFORMS.flatMap((p): [string, string][] => (brand[p] === undefined ? [] : [[p, brand[p] as string]]));
      for (const [platform, name] of pairs) {
        const key = `${platform}:${scopeOf(canonical)}.${name}`;
        const first = seenEvent.get(key);
        const on = platform === '' ? '' : ` on ${platform}`;
        if (first !== undefined) {
          ctx.issues.push({ code: 'custom', input: brand, path: ['events', canonical], message: `${canonical} and ${first} both rename to ${name}${on}` });
        } else seenEvent.set(key, canonical);
      }
    }
    // Values compare within one key. A brand value that is another of the key's canonical values is refused even
    // when that value is renamed too: a swap is invertible by a single-pass scan, but not by a reader.
    for (const [key, renames] of Object.entries(values)) {
      const seenValue = new Map<string, string>();
      for (const [value, brand] of Object.entries(renames)) {
        if (value === brand) continue;
        const first = seenValue.get(brand);
        if (first !== undefined) {
          ctx.issues.push({ code: 'custom', input: brand, path: ['values', key, value], message: `${key}.${value} and ${key}.${first} both rename to ${brand}` });
        } else seenValue.set(brand, value);
        if (Object.hasOwn(renames, brand)) {
          ctx.issues.push({ code: 'custom', input: brand, path: ['values', key, value], message: `${key}.${value} renames to ${brand}, which is already one of its values` });
        }
      }
    }
    // An alias is an old spelling of the current name, so it cannot be that name; and within one scope (all
    // component aliases, a component's prop aliases, a prop's value aliases) two entries cannot share a name.
    const aliasScope = (kind: string, scope: string, path: (string | number)[], label: string, current: string, list: { name: string }[], seen: Map<string, string>): void => {
      list.forEach((entry, i) => {
        const where = `aliases.${label}[${i}]`;
        if (entry.name === current) {
          ctx.issues.push({ code: 'custom', input: entry.name, path: [...path, i, 'name'], message: `${where} is ${entry.name}, which is already the current name it aliases` });
        }
        const key = `${kind}:${scope}.${entry.name}`;
        const first = seen.get(key);
        if (first !== undefined) {
          ctx.issues.push({ code: 'custom', input: entry.name, path: [...path, i, 'name'], message: `${where} and ${first} are both called ${entry.name}` });
        } else seen.set(key, where);
      });
    };
    const seenAlias = new Map<string, string>();
    for (const [canonical, list] of Object.entries(aliases.components ?? {})) {
      aliasScope('component', '', ['aliases', 'components', canonical], `components.${canonical}`, components[canonical] ?? canonical, list, seenAlias);
    }
    for (const [key, list] of Object.entries(aliases.props ?? {})) {
      const member = key.includes('.') ? (key.split('.')[1] as string) : key;
      const current = props[key] ?? (key.includes('.') ? props[member] : undefined) ?? member;
      aliasScope('prop', scopeOf(key), ['aliases', 'props', key], `props.${key}`, current, list, seenAlias);
    }
    for (const [key, byValue] of Object.entries(aliases.values ?? {})) {
      const member = key.includes('.') ? (key.split('.')[1] as string) : key;
      for (const [value, list] of Object.entries(byValue)) {
        const current = values[key]?.[value] ?? (key.includes('.') ? values[member]?.[value] : undefined) ?? value;
        aliasScope('value', key, ['aliases', 'values', key, value], `values.${key}.${value}`, current, list, seenAlias);
      }
    }
  })
  .meta({ id: 'namingDef' });

/** `Button.variant` → `Button`, `variant` → `''`: the component a map key is scoped to. */
function scopeOf(key: string): string {
  return key.includes('.') ? (key.split('.')[0] as string) : '';
}

/**
 * The whole frontmatter of a naming doc. `naming` itself defaults, so a brand with no naming.md —
 * or one that carries only prose — resolves to the canonical vocabulary and renames nothing.
 */
export const namingFrontmatter = z.object({
  naming: namingDef.prefault({}),
});

/** The unrenamed case, as a value: what every consumer sees when no naming.md exists. */
export function namingDefaults(): NamingDef {
  return namingDef.parse({});
}

export type NamespaceDef = z.infer<typeof namespaceDef>;
export type NamingDef = z.infer<typeof namingDef>;
