/**
 * Naming frontmatter schema (Zod) — the single source of truth for a brand's names.
 *
 * A naming doc (`themes/<brand>/naming.md`) is a *sibling* of a theme doc, never an edit to a
 * canonical component doc: a theme tailors the look, a naming doc tailors the identifiers the
 * generators emit. See site/src/content/docs/process/customization-and-naming.md for why the two
 * are separate files (it is also what makes an upstream pull conflict-free).
 *
 * What it renames: generated *output* identifiers only — the package scope, the CSS
 * custom-property prefix, per-platform type-name prefixes, component names, prop/anatomy names.
 * What it never touches: the canonical schema's own keys (`props.variant`, `a11y.role`, token
 * paths like `color.action.primary.background`). The gates key off those, so they stay fixed
 * across every fork and never need to know a brand called `Button` something else.
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

import { platformId } from './component.ts';

/** A generated type/struct/class identifier: PascalCase. */
const typeName = z.string().regex(/^[A-Z][A-Za-z0-9]*$/, 'Expected a PascalCase identifier like CtaButton');
/** A generated prop or anatomy identifier: camelCase. */
const memberName = z.string().regex(/^[a-z][A-Za-z0-9]*$/, 'Expected a camelCase identifier like style');

export const namespaceDef = z
  .strictObject({
    /** The npm scope generated packages publish under: `@acme` → `@acme/react`, `@acme/lit`. */
    package: z
      .string()
      .regex(/^@[a-z0-9][a-z0-9._-]*$/, "Expected an npm scope like @acme (leading @, no slash)")
      .default('@design-schema')
      .describe('npm scope for the generated packages: @acme → @acme/react, @acme/lit, @acme/tokens.'),
    /** The CSS custom-property prefix, without the leading `--` or trailing `-`: `acme` → `--acme-button-background`. */
    cssPrefix: z
      .string()
      .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, 'Expected a lowercase prefix like acme, written without the leading -- or trailing -')
      .default('ds')
      .describe('CSS custom-property prefix, written without the leading -- or trailing -: acme → --acme-button-background.'),
    /** Per-platform prefix on generated type names, for the platforms that have one. */
    typePrefix: z
      .partialRecord(platformId, typeName)
      .default({})
      .describe("Per-platform prefix on generated type names where one exists (SwiftUI's DesignSchemaTokens module and its TokenRef enum, React Native's theme context). A platform left out keeps the canonical name."),
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
  })
  .check((ctx) => {
    const { components, props } = ctx.value;
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
  })
  .meta({ id: 'namingDef' });

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
