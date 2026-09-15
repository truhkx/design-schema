Add an optional `values` map to the naming doc, so a brand can rename a prop's enum values the way `props` renames the prop itself. Read site/src/content/docs/process/schema-hardening.md, "Rules every job follows", and site/src/content/docs/process/customization-and-naming.md ("How the rename is applied", and the job 523 section) first.

An adopter's existing API is the reason this exists: a brand that already ships `<Button kind="cta">` can rename `variant` to `kind` today, but not `primary` to `cta`. Generated types carry the canonical values (`export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'` in packages/react/src/Button.tsx and packages/lit/src/Button.ts), and schema/naming.ts has no field for them. An extension cannot help either: `mergeExtensions` in tools/parse.ts rejects `props.variant` from an extension as a collision with the component's own schema. The canonical values are in generated/components.json (`props.variant: { type: enum, values: [primary, secondary, ghost, danger] }`); 48 components have an enum prop, and many values are shared (`md` on 17 components, `none` on 20, `danger` on 8), so a value is only a rename when the codemod can prove *which prop* it belongs to.

The hazard is concrete, and it is in Button already. `primary` appears in places that belong to the prop and must move: `variant = 'primary'`, the `ButtonVariant` union, `ds-button--${variant}` with its `.ds-button--primary` rule, RN's `VARIANT_TOKENS = { primary: {…} }`, Lit's `:host([variant='primary'])`, `args: { variant: 'primary' }` in stories, and `setup({"variant": "primary"})` in generated/behavior. It also appears in places that are canonical and must not move: `var(--color-action-primary-background)`, RN's `'colorActionPrimaryBackground'`, and the prose "Use the `primary` variant". A rewrite that matched the bare word would rename a token and break every theme.

Depends on 623 (naming `events` and `anatomy` maps) and 619 (`enumRef`). Confirm first that schema/naming.ts has the maps 623 added, and check whether generated/components.json still carries `values` on an enum prop that uses `enumRef`. If either is missing, stop and say so rather than guessing their shape.

1. **Schema.** In schema/naming.ts add `values`, optional and defaulting to `{}`. It is keyed exactly like `props`: the same key regex, a bare `variant` or a dotted `Button.variant`, always the *canonical* prop name (never the brand's `emphasis`). Each key maps to a record of canonical value → brand value. Export one `enumValueName` regex, `^[A-Za-z0-9][A-Za-z0-9-]*$` (a value must survive a CSS modifier class and a Lit attribute selector), and use it on both sides. Extend the existing `.check`:
   - Two canonical values of one key renamed onto one brand value is an issue. Use the `props` wording: `<key>.<value> and <key>.<other> both rename to <brand>`.
   - A brand value that equals another canonical value of the same key is an issue: `<key>.<value> renames to <brand>, which is already one of its values`. This rules out swaps, which a single-pass scan could invert but a reader could not.
   - A value mapped to itself is dropped the way `renamesOnly` drops identity renames.
   Describe the field with `.describe()`, including the precedence below, and run `node --import tsx tools/schema.ts` to regenerate schema/naming.schema.json.
2. **Precedence.** The resolved map is per component, per prop, per value. A dotted key's entry wins over the bare key's entry for the same value, and the two merge otherwise. Given `tone: { danger: critical }` and `Alert.tone: { info: notice }`, Alert gets both. The map for a prop is looked up by its canonical name even when `props` renames the prop.
3. **Resolution checks** in tools/naming.ts, beside `unknownKeys`, reported through `assertKnownKeys` so a stranded value fails the run the way a stranded prop does:
   - A dotted key whose component has no such prop: `values.Button.varient: Button has no prop called varient`.
   - A prop that exists but is not `type: enum`: `values.Button.label: Button.label is not an enum prop`.
   - A value the prop does not have: `values.Button.variant.primray: Button.variant has no value primray`.
   - A bare key that matches no enum prop anywhere, or a value no matching enum prop has.
   - If generated/components.json has no `values` for a prop whose enum comes from `enumRef`, resolve the values through schema/vocab.ts rather than skipping the check.
4. **Resolution and no-op.** `Resolution` gains `values`, holding renames only. `isNoop` is false when it is non-empty. `main` prints the value count on its summary line. A naming doc without `values` resolves exactly as before.
5. **The rewrite.** Build the per-direction value map in `vocab` (brand → canonical is the exact inverse). In `rewrite`, rename a value only in contexts that tie it to one prop, scoped by the same `scopeAt` logic `propAt` uses (own file, or the opening tag of a composed element). All other positions are left alone. Each rule is a scan alternative placed *after* `GATE_HOOK` and the `::part(` rule:
   - a JSX or HTML attribute on the component's element: `variant="primary"`, `variant={'primary'}`, and the brand spelling of the prop name (the prop rename and the value rename apply in the same pass)
   - a Lit attribute selector: `[variant='primary']` / `:host([variant="primary"])`
   - an object property or JSON key naming the prop: `variant: 'primary'`, `"variant": "primary"`
   - a default: `variant = 'primary'` in a destructuring, `accessor variant: ButtonVariant = 'primary'`
   - a comparison or switch on the prop: `variant === 'primary'`, `variant !== 'primary'`, and `case 'primary':` inside `switch (variant)`
   - a string-literal union in a type alias named `<Component><PascalProp>` (`ButtonVariant`), or in the prop's own declaration (`size?: 'sm' | 'md'`)
   - a component modifier class carrying the namespace prefix: `ds-button--primary` in CSS and TS. It is renamed where `renameCssName` handles the stem, so the stem and value change in one match.
   - an object literal whose key set equals the prop's full canonical value set (`VARIANT_TOKENS`). Rename it only if no other enum prop of the same component has the same value set; otherwise it is ambiguous.
   - SwiftUI: an `enum <Component><PascalProp>` whose cases equal the value set, and `case .primary` inside `switch <prop>`. A bare `.primary` elsewhere is ambiguous, because `.primary` is also a SwiftUI `ShapeStyle`.
   Never rename a value inside a token reference: `var(--…)` that is not a component hook, a dotted token path, a camelCase token key like `colorActionPrimaryBackground`, a comment, or a `data-ds`/`data-part`/`part`/`testID` hook.
6. **Ambiguity is reported, not guessed.** A quoted string literal equal to a renamed value is an ambiguous hit when it sits in a file the prop's scope reaches and matches no rule above. So is a template literal that interpolates the prop into a token name (`` `color.action.${variant}.background` ``, `` var(--color-action-${variant}-background) ``). Add `ambiguous?: string[]` to `Applied` (`<file>:<line>: <trimmed line>`), set only when non-empty so existing `toEqual({ edited: [], renames: [] })` assertions still hold. `main` prints each hit as `  ! <platform>: ambiguous value …`, and `printRename` in tools/generate.ts prints the count. An ambiguous hit is left untouched in both directions, which keeps brand → canonical → brand exact. This is naming.ts's existing reporting style (the `  ! <platform>: …` lines `collisions` already prints), carried on the rename result. It is not a parse warning: do not route it through job 609's `warn`/`takeWarnings` or `generated/parse-warnings.json`, and do not add another warning mechanism.
7. **Fixture.** Extend themes/nimbus/naming.md with `values` exercising both scopes and the merge, e.g. `Button.variant: { danger: destructive }`, `tone: { danger: critical }`, `Alert.tone: { info: notice }`. Add a paragraph to its prose in the style of the existing ones. Do **not** extend themes/demo-brand/naming.md: apps/website/src/components/NamingDemo.tsx passes `emphasis="primary"` to the demo's `CtaButton`, and that page and tests/website/naming-demo.spec.ts are outside this job's gate.
8. **Tests** in tools/__tests__/ (naming.test.ts for the schema, naming_resolver.test.ts for resolution and rewrite):
   - one failing fixture per check in steps 1 and 3
   - the precedence merge in step 2
   - one test per rewrite context in step 5, each asserting the canonical token next to it (`var(--color-action-primary-background)`, `'colorActionPrimaryBackground'`) is unchanged
   - an ambiguous hit reported and not rewritten
   - an interpolated token name reported
   - a naming doc with no `values` producing byte-identical output
   - **Round trip.** Copy the committed packages/react/src/Button.tsx, Button.css, Button.stories.tsx and packages/rn/src/Button.tsx and packages/lit/src/Button.ts into the sandbox with node:fs. Apply a doc with `Button.variant` values on each platform and assert every value context moved. Revert and assert every file is byte-for-byte the canonical original. Apply again and assert byte-for-byte equality with the first apply.
9. **Docs.** In site/src/content/docs/process/customization-and-naming.md add `values` to the list of what a naming doc overrides, and a bullet under "How the rename is applied" stating the provable contexts, what is reported as ambiguous, and why token paths never move. Add one sentence to "What it does not rename" in themes/nimbus/naming.md if the fixture paragraph needs it.

There is no shell copy in this environment. Do scratch work inside tests with node:fs, or under logs/ (gitignored).

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm demo:naming:check
    node --import tsx tools/naming.ts --naming nimbus --platform web,lit,rn --check
    node --import tsx tools/naming.ts --naming demo-brand --platform web --check
    node logs/600-baseline.mjs --out 626

The nimbus `--check` run exits 0 and prints a value count and any ambiguous hits. Put the ambiguous list in your summary, since those are the cases a brand would have to hand-review. The demo-brand run exits 0 and reports the same file and move counts it reported before this job; it has no `values`. In logs/600-measure-626.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

Do not modify `packages/*/src`, `prompts/templates/`, `packages/react/demo-brand/`, themes/demo-brand/naming.md, or any doc under site/src/content/docs/components/. This job adds a rename; it does not add, remove or reorder enum values, which is extension territory (job 622).
